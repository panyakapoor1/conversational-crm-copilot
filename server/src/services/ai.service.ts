import { GoogleGenAI } from '@google/genai';

/**
 * AI Service — the brain of the CRM.
 *
 * Every function calls Gemini (gemini-2.5-flash) via the Google Gen AI SDK
 * to generate MongoDB queries, personalised messages, campaign intelligence,
 * and conversational responses grounded in live CRM data.
 */

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = 'gemini-2.5-flash';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extracts a JSON object from a Gemini response that may include markdown
 * code fences or explanatory text around the JSON.
 */
function extractJSON(text: string): any {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Strip markdown code fences
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) {
      return JSON.parse(fenced[1].trim());
    }
    // Try finding the first { ... } or [ ... ] block
    const braceMatch = text.match(/(\{[\s\S]*\})/);
    if (braceMatch) {
      return JSON.parse(braceMatch[1]);
    }
    const bracketMatch = text.match(/(\[[\s\S]*\])/);
    if (bracketMatch) {
      return JSON.parse(bracketMatch[1]);
    }
    throw new Error('Could not extract JSON from AI response');
  }
}

/**
 * Sends a message to Gemini and returns the text content.
 */
async function askAI(
  systemInstruction: string,
  userMessage: string
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    if (response.text) {
      return response.text;
    }
    throw new Error('Unexpected response type from Gemini');
  } catch (error: any) {
    const msg = error?.message || '';
    if (msg.includes('429') || msg.includes('Quota') || error?.status === 429 || error?.status === 503) {
      console.warn('⚠️ Gemini quota exhausted. Falling back to Groq API...');
      return await askGroqFallback(systemInstruction, userMessage);
    }
    throw error;
  }
}

async function askGroqFallback(systemInstruction: string, userMessage: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('API_LIMIT_REACHED: Gemini quota exhausted and GROQ_API_KEY is not configured.');
  }

  // We can use the global fetch since Node 18+ has it built-in
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API Error: ${response.status} - ${errText}`);
  }

  const data = await response.json() as any;
  if (data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content;
  }
  throw new Error('Unexpected response format from Groq API');
}

// ---------------------------------------------------------------------------
// 1. Generate Segment Query
// ---------------------------------------------------------------------------

interface SegmentQueryResult {
  mongoQuery: object;
  explanation: string;
  estimatedCount: number;
}

export async function generateSegmentQuery(
  naturalLanguageQuery: string,
  customerStats: any
): Promise<SegmentQueryResult> {
  const systemPrompt = `You are an expert MongoDB query generator for a Keventers CRM system.

The Customer collection has the following schema:
- name: string
- email: string
- phone: string
- city: string (one of: Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Pune, Noida, Gurgaon)
- totalSpend: number (in INR)
- orderCount: number
- lastOrderDate: Date (ISO string)
- firstOrderDate: Date (ISO string)
- averageOrderValue: number
- favouriteProduct: string
- favouriteCategory: string (one of: Classic Shakes, Signature Shakes, Seasonal Specials, Cold Coffees, Merchandise)
- tags: string[] (possible values: loyalist, mango-lover, at-risk, churned, new, lapsed)
- channelPreference: 'whatsapp' | 'sms' | 'email'
- engagementScore: number (0-100)
- lastChannelInteraction: { whatsapp?: Date, sms?: Date, email?: Date }

Current customer stats:
${JSON.stringify(customerStats, null, 2)}

RULES:
- Generate a valid MongoDB query object that can be passed to Customer.find()
- Use $gte, $lte, $in, $regex, $exists, $elemMatch as needed
- For date comparisons, use ISO date strings like { "$gte": "2024-01-01T00:00:00.000Z" }
- Return ONLY valid JSON in this exact format:
{
  "mongoQuery": { <the MongoDB query> },
  "explanation": "<human-readable explanation of what this query does>",
  "estimatedCount": <estimated number of matching customers based on the stats>
}`;

  const raw = await askAI(systemPrompt, naturalLanguageQuery);
  const parsed = extractJSON(raw);

  return {
    mongoQuery: parsed.mongoQuery || {},
    explanation: parsed.explanation || '',
    estimatedCount: parsed.estimatedCount || 0,
  };
}

// ---------------------------------------------------------------------------
// 2. Generate Segment Suggestions
// ---------------------------------------------------------------------------

interface SegmentSuggestion {
  name: string;
  description: string;
  naturalLanguageQuery: string;
  mongoQuery: object;
  reasoning: string;
}

export async function generateSegmentSuggestions(
  customerStats: any
): Promise<SegmentSuggestion[]> {
  const systemPrompt = `You are a CRM strategist for Keventers, India's iconic milkshake and beverage brand.

Analyse the customer data statistics below and suggest 6 highly actionable customer segments that would drive revenue and retention.

Customer schema fields available for querying:
- name, email, phone, city
- totalSpend, orderCount, lastOrderDate, firstOrderDate, averageOrderValue
- favouriteProduct, favouriteCategory
- tags: ['loyalist', 'mango-lover', 'at-risk', 'churned', 'new', 'lapsed', 'discount_hunter', 'lapsing_regular', 'loyal_subscriber', 'new_promising', 'one_time_tryer', 'seasonal_gifter']
- channelPreference: 'whatsapp' | 'sms' | 'email'
- engagementScore: 0-100

Think about:
- Mango season re-engagement (seasonal lapsed customers)
- VIP loyalists who deserve rewards
- At-risk customers showing declining engagement
- New customer activation and conversion
- City-specific campaigns
- Channel-optimised outreach

RULES:
- The response must be STRICTLY valid JSON.
- For mongoQuery, do NOT use Javascript date objects (like new Date() or ISODate()). Use ISO date strings instead (e.g. "2024-01-01T00:00:00.000Z").
- All keys and string values must be enclosed in double quotes.

Return ONLY valid JSON as an array of exactly 6 objects:
[
  {
    "name": "<segment name>",
    "description": "<2-3 sentence description>",
    "naturalLanguageQuery": "<the query in plain English>",
    "mongoQuery": { <valid MongoDB query for Customer.find()> },
    "reasoning": "<why this segment matters for Keventers' business>"
  }
]`;

  const raw = await askAI(
    systemPrompt,
    `Here are the current customer statistics:\n${JSON.stringify(customerStats, null, 2)}`
  );
  const parsed = extractJSON(raw);

  if (!Array.isArray(parsed)) {
    throw new Error('AI did not return an array of segment suggestions');
  }

  return parsed.map((s: any) => ({
    name: s.name || 'Untitled Segment',
    description: s.description || '',
    naturalLanguageQuery: s.naturalLanguageQuery || '',
    mongoQuery: s.mongoQuery || {},
    reasoning: s.reasoning || '',
  }));
}

// ---------------------------------------------------------------------------
// 3. Generate Personalised Messages
// ---------------------------------------------------------------------------

interface PersonalizedMessage {
  customerId: string;
  personalizedMessage: string;
  channel: 'whatsapp' | 'sms' | 'email';
  channelReason?: string;
}

export async function generatePersonalizedMessages(
  customers: any[],
  messageTemplate: string,
  campaignName: string,
  campaignChannel: string = 'mixed'
): Promise<PersonalizedMessage[]> {
  // Process in batches of 20 to avoid hitting token limits
  const BATCH_SIZE = 20;
  const allMessages: PersonalizedMessage[] = [];

  for (let i = 0; i < customers.length; i += BATCH_SIZE) {
    const batch = customers.slice(i, i + BATCH_SIZE);

    const customerSummaries = batch.map((c: any) => ({
      id: c._id.toString(),
      name: c.name,
      city: c.city,
      totalSpend: c.totalSpend,
      orderCount: c.orderCount,
      favouriteProduct: c.favouriteProduct,
      favouriteCategory: c.favouriteCategory,
      channelPreference: c.channelPreference,
      engagementScore: c.engagementScore,
      tags: c.tags,
      lastOrderDate: c.lastOrderDate,
    }));

    const systemPrompt = `You are a marketing copywriter for Keventers, India's iconic milkshake brand.

Your job is to personalise a campaign message for each customer. Make each message feel genuinely personal — use their name, reference their favourite product, acknowledge their city, and adapt tone based on their engagement level.

Campaign: "${campaignName}"
Message Template: "${messageTemplate}"
Campaign Channel Setting: "${campaignChannel}"

RULES:
- Keep messages under 160 characters for SMS, 300 for WhatsApp, 500 for email
- Use the customer's name naturally (e.g. "Hey Aarav!" not "Dear Aarav,")
- Reference their favourite product or category when relevant
- For high-engagement customers (score > 70): warm, familiar tone
- For low-engagement customers (score < 30): re-engagement tone with a hook
- For new customers (tag: 'new'): welcoming, discovery tone
- Channel Selection:
  - If the Campaign Channel Setting is "whatsapp", "sms", or "email", you MUST use that exact channel for all customers in this batch. Provide a brief reason acknowledging this constraint.
  - If the Campaign Channel Setting is "mixed" (or any other value), perform Smart Channel Optimization:
    - If the customer is at high risk of churn or low engagement (engagementScore < 30), route to 'sms' for direct/urgent re-engagement, or 'email' if they have a low spend history to save budget.
    - If the customer is a high-spending VIP/Loyalist (engagementScore > 70 or tag contains 'loyalist'), route to 'whatsapp' to maximize conversion (since WhatsApp is expensive but has the highest VIP engagement).
    - Otherwise, default to the customer's own channelPreference (defaulting to 'whatsapp' if none is clear).
- Include relevant emoji for WhatsApp messages
- Keep it authentic to Keventers' fun, youthful brand voice
- For every customer, you MUST generate a concise, professional sentence under "channelReason" explaining exactly why that channel was chosen (e.g., "VIP routed to WhatsApp for maximum conversion impact", "Low-engagement risk customer routed to direct SMS", "Using preferred channel WhatsApp for active subscriber").

Return ONLY valid JSON as an array:
[
  {
    "customerId": "<customer id>",
    "personalizedMessage": "<the personalised message>",
    "channel": "whatsapp" | "sms" | "email",
    "channelReason": "<concise reason explaining the choice>"
  }
]`;

    try {
      const raw = await askAI(
        systemPrompt,
        `Personalise messages for these customers:\n${JSON.stringify(customerSummaries, null, 2)}`
      );
      const parsed = extractJSON(raw);

      if (Array.isArray(parsed)) {
        allMessages.push(
          ...parsed.map((m: any) => ({
            customerId: m.customerId,
            personalizedMessage: m.personalizedMessage || messageTemplate,
            channel: m.channel || 'whatsapp',
            channelReason: m.channelReason || 'Default channel assigned.',
          }))
        );
      }
    } catch (error: any) {
      console.warn('[Gemini Fallback] API Limit Reached or Error:', error.message);
      allMessages.push(
        ...batch.map((c: any) => ({
          customerId: c._id.toString(),
          personalizedMessage: messageTemplate.replace(/{Name}/gi, c.name).replace(/{city}/gi, c.city),
          channel: campaignChannel === 'mixed' ? c.channelPreference || 'whatsapp' : (campaignChannel as 'whatsapp' | 'sms' | 'email'),
          channelReason: 'Fallback assigned due to API rate limit.',
        }))
      );
    }
  }

  return allMessages;
}

// ---------------------------------------------------------------------------
// 4. Generate Campaign Intelligence
// ---------------------------------------------------------------------------

export async function generateCampaignIntelligence(
  campaign: any,
  communications: any[]
): Promise<string> {
  const channelBreakdown = {
    whatsapp: { total: 0, delivered: 0, opened: 0, clicked: 0, failed: 0 },
    sms: { total: 0, delivered: 0, opened: 0, clicked: 0, failed: 0 },
    email: { total: 0, delivered: 0, opened: 0, clicked: 0, failed: 0 },
  };

  for (const comm of communications) {
    const ch = comm.channel as 'whatsapp' | 'sms' | 'email';
    if (channelBreakdown[ch]) {
      channelBreakdown[ch].total++;
      if (['delivered', 'opened', 'clicked'].includes(comm.status)) {
        channelBreakdown[ch].delivered++;
      }
      if (['opened', 'clicked'].includes(comm.status)) {
        channelBreakdown[ch].opened++;
      }
      if (comm.status === 'clicked') {
        channelBreakdown[ch].clicked++;
      }
      if (comm.status === 'failed') {
        channelBreakdown[ch].failed++;
      }
    }
  }

  const systemPrompt = `You are a marketing analytics expert for Keventers, India's milkshake brand.

Generate a concise, actionable post-campaign intelligence report in markdown format.

Structure your report as:
## Campaign Intelligence Report: <campaign name>

### 📊 Performance Summary
(key metrics with percentages)

### ✅ What Worked
(2-3 bullet points)

### ❌ What Didn't Work
(2-3 bullet points)

### 📱 Channel Breakdown
(table with channel / sent / delivered / opened / clicked / failed)

### 🔍 Engagement Patterns
(insights about customer behaviour)

### 🎯 Next Best Action
(ONE specific, actionable recommendation for the next campaign)

Be data-driven. Reference actual numbers. Be specific to Keventers' business context.`;

  const userMessage = `Campaign data:
${JSON.stringify({
    name: campaign.name,
    channel: campaign.channel,
    messageTemplate: campaign.messageTemplate,
    stats: campaign.stats,
    channelBreakdown,
    totalCommunications: communications.length,
    sentAt: campaign.sentAt,
  }, null, 2)}`;

  return await askAI(systemPrompt, userMessage);
}

// ---------------------------------------------------------------------------
// 5. Generate Smart Send Time
// ---------------------------------------------------------------------------

interface SmartSendTime {
  recommendedTime: string;
  reasoning: string;
  confidence: number;
}

export async function generateSmartSendTime(
  segmentCustomers: any[]
): Promise<SmartSendTime> {
  const engagementProfile = {
    avgEngagementScore:
      segmentCustomers.reduce((sum, c) => sum + (c.engagementScore || 0), 0) /
      segmentCustomers.length || 0,
    channelMix: {
      whatsapp: segmentCustomers.filter((c) => c.channelPreference === 'whatsapp').length,
      sms: segmentCustomers.filter((c) => c.channelPreference === 'sms').length,
      email: segmentCustomers.filter((c) => c.channelPreference === 'email').length,
    },
    cityMix: segmentCustomers.reduce((acc: Record<string, number>, c) => {
      acc[c.city] = (acc[c.city] || 0) + 1;
      return acc;
    }, {}),
    tagMix: segmentCustomers.reduce((acc: Record<string, number>, c) => {
      (c.tags || []).forEach((t: string) => {
        acc[t] = (acc[t] || 0) + 1;
      });
      return acc;
    }, {}),
    totalCustomers: segmentCustomers.length,
    lastInteractions: segmentCustomers
      .filter((c) => c.lastChannelInteraction)
      .slice(0, 20)
      .map((c) => c.lastChannelInteraction),
  };

  const systemPrompt = `You are a marketing timing optimisation expert for Keventers (India-based milkshake brand).

Analyse the segment's engagement profile and recommend the optimal send time for a campaign.

Consider:
- Indian Standard Time (IST / UTC+5:30)
- Keventers customers are primarily young urban professionals and college students
- Milkshake cravings peak in afternoons and evenings
- WhatsApp has highest open rates in late morning / early evening
- SMS should be sent during waking hours only
- Email works best mid-morning on weekdays
- Weekend vs weekday patterns
- City-specific patterns (Mumbai commuters, Delhi office hours, Bengaluru tech crowd)

Return ONLY valid JSON:
{
  "recommendedTime": "<day and time, e.g. 'Tuesday 4:30 PM IST'>",
  "reasoning": "<2-3 sentences explaining why>",
  "confidence": <0.0 to 1.0>
}`;

  const raw = await askAI(
    systemPrompt,
    `Segment engagement profile:\n${JSON.stringify(engagementProfile, null, 2)}`
  );
  const parsed = extractJSON(raw);

  return {
    recommendedTime: parsed.recommendedTime || 'Tuesday 4:30 PM IST',
    reasoning: parsed.reasoning || 'Default recommendation based on general patterns.',
    confidence: parsed.confidence || 0.7,
  };
}

// ---------------------------------------------------------------------------
// 6. Chat with AI (RAG-powered)
// ---------------------------------------------------------------------------

export async function chatWithAI(
  message: string,
  context: {
    customerStats: any;
    recentCampaigns: any[];
    segments: any[];
  }
): Promise<string> {
  const systemPrompt = `You are Xeno AI, an intelligent CRM assistant for Keventers — India's iconic milkshake and beverage brand.

You have access to LIVE CRM data below. Use it to answer questions accurately.

=== LIVE CRM DATA ===

CUSTOMER STATS:
${JSON.stringify(context.customerStats, null, 2)}

RECENT CAMPAIGNS (last 10):
${JSON.stringify(context.recentCampaigns, null, 2)}

EXISTING SEGMENTS:
${JSON.stringify(context.segments, null, 2)}

=== END LIVE DATA ===

CAPABILITIES:
- Answer questions about customer data, segments, and campaigns
- Suggest new segments based on data patterns
- Recommend campaign strategies
- Provide analytics insights
- Help with customer engagement strategies

RULES:
- Always ground your answers in the actual data provided
- Be specific — use real numbers, percentages, city names
- If asked to create a segment, describe the criteria clearly
- Keep responses concise but insightful
- Use Keventers-specific context (milkshakes, mango season, Indian cities)
- Format responses in markdown when appropriate
- If you don't have enough data to answer, say so honestly`;

  return await askAI(systemPrompt, message);
}

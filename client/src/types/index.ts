export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  totalSpend: number;
  orderCount: number;
  lastOrderDate?: string;
  firstOrderDate?: string;
  averageOrderValue: number;
  favouriteProduct?: string;
  favouriteCategory?: string;
  tags: string[];
  channelPreference: 'whatsapp' | 'sms' | 'email';
  engagementScore: number;
  lastChannelInteraction?: {
    whatsapp?: string;
    sms?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  customerId: string;
  products: { name: string; category: string; price: number; quantity: number }[];
  totalAmount: number;
  orderDate: string;
  city: string;
  createdAt: string;
  updatedAt: string;
}

export interface Segment {
  _id: string;
  name: string;
  description?: string;
  mongoQuery: string;
  naturalLanguageQuery: string;
  customerCount: number;
  customerIds: string[];
  aiGenerated: boolean;
  aiReasoning?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  _id: string;
  name: string;
  segmentId: string | Segment;
  messageTemplate: string;
  channel: 'whatsapp' | 'sms' | 'email' | 'mixed';
  status: 'draft' | 'sending' | 'sent' | 'completed';
  scheduledAt?: string;
  sentAt?: string;
  completedAt?: string;
  stats: {
    total: number;
    queued: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
  };
  aiSuggestions?: { sendTime: string; reasoning: string };
  intelligenceReport?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Communication {
  _id: string;
  campaignId: string;
  customerId: string | Customer;
  channel: 'whatsapp' | 'sms' | 'email';
  channelReason?: string;
  personalizedMessage: string;
  status: 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  failedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CustomerStats {
  totalCustomers: number;
  avgSpend: number;
  totalRevenue: number;
  cityBreakdown: Record<string, number>;
  tagBreakdown: Record<string, number>;
  spendDistribution: Record<string, number>;
  dateRange: { start: string; end: string };
}

export interface SegmentSuggestion {
  name: string;
  description: string;
  naturalLanguageQuery: string;
  mongoQuery: string;
  reasoning: string;
  estimatedCount?: number;
}

# Keventers CRM — AI-Native Mini CRM for Reaching Shoppers

An AI-native mini CRM built for a specialty-coffee and beverage D2C brand (**Keventers**). Instead of navigating a complex series of dashboards and manual segment filters, a marketer describes a campaign goal in plain English (e.g., *"win back mango lovers who haven't ordered in the last month"*). The AI co-pilot proposes the exact audience segment, drafts personalized messages, and tracks delivery in real-time.

This project uses a unified **TypeScript/Node.js** architecture with a real-time WebSocket connection to stream campaign events (delivery, open, click) live as they happen.

---

## Why Keventers? (Real-World Business Context)

Choosing **Keventers**—the popular Indian milkshake and beverage brand—is a deliberate choice to ground this CRM in **real business context**:
* **Xeno's Portfolio**: Keventers is one of Xeno's actual clients, aligning this assignment directly with real-world D2C operations.
* **Realistic Seeding**: The synthetic data script generates realistic Indian D2C parameters (prices in ₹179 - ₹399, metro cities like Delhi/Mumbai/Bengaluru, and specific categories like *Classic Shakes*, *Signature Shakes*, and *Seasonal specials*).
* **Behavior-driven Segments**: The seeded database features natural retail cohorts, such as the **"Mango Season Lapsed"** segment (shoppers who ordered heavily during the summer mango season but went quiet as monsoon started), giving the AI co-pilot real-world marketing challenges to solve.

---

## Architecture & System Design

The application consists of three services connected in a real-time callback loop:

```
                      goal / approve
  ┌────────────────┐ ◀──────────────▶ ┌─────────────────┐
  │  client        │                  │  server (CRM)   │
  │  (React/Vite)  │ ◀────────────────│  - Express/TS   │
  │  - Dashboard   │  WebSockets      │  - MongoDB      │
  │  - Chat Copilot│  (Socket.io)     │  - Gemini AI    │
  └────────────────┘                  └────────┬────────┘
                                               │
                                 send(message) │   ▲ async callbacks
                                               │   │ (delivery status)
                                      ┌────────▼───┴────────┐
                                      │  channel-service    │
                                      │  - Simulates sending│
                                      │  - Delay simulation │
                                      └─────────────────────┘
```

### The Async Loop & Real-Time Stats
1. **Goal Submission**: The marketer interacts with the AI Copilot. The AI evaluates the prompt, queries the database, creates the segment definition, and drafts the personalized copy.
2. **Campaign Launch**: Once approved, the campaign is initiated. The CRM backend dispatches the messages to the `channel-service`.
3. **Async Callback Simulation**: The `channel-service` asynchronously processes the messages, applying random delays to simulate real-world delivery latency, and fires callbacks (`delivered`, `opened`, `clicked`) back to the CRM server.
4. **WebSocket Streaming**: Upon receiving status updates, the CRM backend updates MongoDB and immediately streams the new campaign stats to the React client via **Socket.io**. The dashboard updates dynamically in real-time.

---

## Why This Solution Wins (Product Strategy)

Unlike typical AI take-home projects that default to a simple chatbox wrapper, **Keventers CRM** combines **structured analytical power** with a **conversational AI co-pilot**. 

| Product Aspect | Chat-Only Wrappers | Keventers CRM (Our Solution) |
| :--- | :--- | :--- |
| **User Experience** | Marketer is forced to operate entirely in a chat dialog, making bulk inspection or editing of records extremely tedious. | A full visual suite (Dashboard charts, Customer tables, Campaign logs) paired with a persistent, floating AI Co-pilot sidebar. |
| **Real-time Feedback** | Stale page updates; requires constant polling or page refreshes to see if a campaign has finished sending. | **WebSockets (Socket.io)** push live delivery, open, and click updates directly to the UI as they happen. |
| **Data Flexibility** | Relational SQL databases that require strict migrations when adding new customer attributes or AI tags. | **MongoDB (NoSQL)** documents allow the AI to generate dynamic user tagging and complex segments on the fly. |
| **Grounding (RAG)** | AI drafts messages blindly or requires massive prompt payloads to understand the context. | In-memory RAG pulls exact customer metrics, recent campaigns, and segments directly from MongoDB to construct prompt context. |

By building a dual-interface dashboard + co-pilot, the marketer gets the benefits of speed through natural language command alongside the visibility and trust of standard visual CRM tables.

---

## Core AI Features & Smart Intelligence

My solution implements several advanced AI capabilities that go beyond simple prompt templates:

### 1. Smart Channel Optimizer (Mixed Mode)
When creating a campaign, the marketer can select **AI Recommended (Mixed)** as the channel. Rather than sending the same message via a single channel, the AI dynamically analyzes each customer's data and route:
* **High-Value VIPs / Loyalists (Score > 70)**: Sent via **WhatsApp** to maximize conversion (capitalizing on high response rates, justifying the higher WhatsApp cost).
* **At-Risk / Low Engagement (Score < 30)**: Routed to **SMS** for direct, urgent win-back or **Email** to save budget on inactive users.
* **Active Subscribers**: Routed to their explicit **Preferred Channel**.
* **AI Reasoning Logs**: Every message shows the precise logic behind the channel selection (e.g. *`via SMS — Low-engagement risk customer routed to direct SMS`*) in the campaign message logs.

### 2. Smart Send Time Suggestion
The AI co-pilot analyzes the segment's customer behaviors and recommends the absolute best hour to dispatch the campaign, along with detailed reasoning (e.g., advising late afternoon sends for signature chocolate milkshakes to hit weekend snack impulses).

### 3. Closed-Loop Campaign Intelligence
After a campaign is sent, the AI analyzes the live delivery, open, and click logs to generate a **Post-Campaign Debrief**. It surfaces what worked, what didn't, and gives one specific action recommendation for the next campaign.

### 4. Natural Language Segment Builder
Instead of clicking through rigid dropdowns, the marketer can write target audience parameters in plain English (e.g., *"Find customers from Mumbai who haven't ordered in 60 days"*). The AI parses this text, compiles it into a **native MongoDB query**, provides a live count preview, and creates the segment dynamically.

### 5. Floating AI Chat Copilot (RAG-Grounded)
A persistent AI sidebar is accessible across all pages. The assistant performs live database retrieval (RAG) on customer stats, recent campaigns, and existing segments before answering, allowing it to:
* Answer complex queries (e.g., *"How many customers haven't ordered in 60 days?"*).
* Recommend campaign angles and draft personalized copy options.
* Provide quick data analysis on campaign performance without needing SQL skills.

---

## Tech Stack

- **Frontend**: React (v19), TypeScript, Vite, Tailwind CSS v4, Socket.io-client.
- **CRM Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose), Socket.io.
- **AI Core**: Google Gemini API (`gemini-2.0-flash-lite` for optimized quota utilization).
- **Channel Service**: Node.js, Express, TypeScript (simulating delivery delay callbacks).

---

## Repository Layout

```text
crm_xeno/
├── client/              React frontend with Vite & Tailwind CSS v4
│   ├── src/
│   │   ├── api/         API connection handlers
│   │   ├── components/  Reusable UI components (glassmorphism dashboard)
│   │   └── pages/       Main pages (Dashboard, Customers, Campaigns)
├── server/              CRM backend (Express, MongoDB models, Gemini service)
│   └── src/
│       ├── routes/      Endpoints for campaigns, customers, and segments
│       ├── services/    Business logic (AI co-pilot, socket handlers)
│       └── seed/        Synthetic data seeding (generates sample customer list)
└── channel-service/     Mock delivery provider running asynchronously
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas connection string
- A Gemini API Key (configured in your `.env` file)

### Setup & Installation

1. **Clone the Repository** and navigate to the root folder.
2. **Configure Environment Variables**:
   Create a `.env` file in the `server/` directory:
   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/crm_xeno
   GEMINI_API_KEY=your_gemini_api_key_here
   CHANNEL_SERVICE_URL=http://localhost:3002
   ```
   Create a `.env` file in the `channel-service/` directory:
   ```env
   PORT=3002
   CRM_BACKEND_URL=http://localhost:3001
   ```

3. **Install Dependencies**:
   ```bash
   # In the root, client, server, and channel-service directories
   npm install
   ```

4. **Seed the Database**:
   ```bash
   cd server
   npm run seed
   ```

5. **Run the Application**:
   Start the services in their respective directories:
   ```bash
   # Start the CRM Server (port 3001)
   cd server && npm run dev

   # Start the Channel Service Simulator (port 3002)
   cd channel-service && npm run dev

   # Start the React Frontend
   cd client && npm run dev
   ```

---

## Key Differences & Trade-offs (Conscious Scope Cuts)
- **Real-Time WebSockets vs Polling**: I opted for a persistent Socket.io connection to ensure stats stream instantly to the user instead of relying on inefficient database polling.
- **MongoDB vs SQL**: Customer CRM attributes are highly fluid (dynamic tags, user preferences, purchase habits). MongoDB’s flexible schema design was chosen to model dynamic segments effortlessly without heavy migrations.
- **Queueing in Production**: In a production environment, I would insert a message broker (e.g., RabbitMQ or BullMQ) between the CRM and the Channel Service to manage rate limits and ensure delivery reliability. For the purposes of this demo, direct asynchronous HTTP calls are used.

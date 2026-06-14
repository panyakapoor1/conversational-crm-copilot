import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

// ────────────────────────────────────────────────────────────────────────────────
// Interfaces
// ────────────────────────────────────────────────────────────────────────────────

interface SendRequest {
  communicationId: string;
  customerId: string;
  channel: 'whatsapp' | 'sms' | 'email';
  message: string;
  callbackUrl: string;
}

interface CallbackPayload {
  communicationId: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed';
  timestamp: string;
}

interface Stats {
  totalReceived: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalFailed: number;
  totalCallbacksSent: number;
  totalCallbacksFailed: number;
}

// ────────────────────────────────────────────────────────────────────────────────
// Stats tracker
// ────────────────────────────────────────────────────────────────────────────────

const stats: Stats = {
  totalReceived: 0,
  totalDelivered: 0,
  totalOpened: 0,
  totalClicked: 0,
  totalFailed: 0,
  totalCallbacksSent: 0,
  totalCallbacksFailed: 0,
};

// ────────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────────

/** Returns a random integer between min (inclusive) and max (inclusive). */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Returns a random float between min and max (in milliseconds). */
function randomDelay(minSeconds: number, maxSeconds: number): number {
  return Math.random() * (maxSeconds - minSeconds) * 1000 + minSeconds * 1000;
}

// ────────────────────────────────────────────────────────────────────────────────
// Callback with retry
// ────────────────────────────────────────────────────────────────────────────────

async function fireCallback(
  callbackUrl: string,
  payload: CallbackPayload,
  retries: number = 2,
): Promise<void> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(callbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(`✅ Callback sent: ${payload.communicationId} → ${payload.status}`);
        stats.totalCallbacksSent++;
        return;
      }

      throw new Error(`HTTP ${response.status}`);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.log(
        `⚠️  Callback attempt ${attempt + 1} failed for ${payload.communicationId}: ${errMsg}`,
      );

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        console.log(`❌ Callback FAILED permanently: ${payload.communicationId}`);
        stats.totalCallbacksFailed++;
      }
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// Delivery simulation
// ────────────────────────────────────────────────────────────────────────────────

function simulateDelivery(req: SendRequest): void {
  const { communicationId, channel, callbackUrl } = req;

  // Initial delay 1-4 seconds before determining outcome
  const initialDelay = randomDelay(1, 4);

  setTimeout(async () => {
    const roll = Math.random();

    // ── 5 % chance: FAILED ──────────────────────────────────────────────
    if (roll < 0.05) {
      stats.totalFailed++;
      console.log(`💥 [${channel}] ${communicationId} → FAILED`);
      await fireCallback(callbackUrl, {
        communicationId,
        status: 'failed',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // ── 10 % chance: SENT (stuck, never delivered) ──────────────────────
    if (roll < 0.15) {
      console.log(`📨 [${channel}] ${communicationId} → SENT (stuck)`);
      await fireCallback(callbackUrl, {
        communicationId,
        status: 'sent',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // ── 85 % chance: DELIVERED ──────────────────────────────────────────
    stats.totalDelivered++;
    console.log(`📬 [${channel}] ${communicationId} → DELIVERED`);
    await fireCallback(callbackUrl, {
      communicationId,
      status: 'delivered',
      timestamp: new Date().toISOString(),
    });

    // 50 % chance the recipient opens the message
    const willOpen = Math.random() < 0.5;
    if (!willOpen) return;

    const openDelay = randomDelay(0.5, 2);
    setTimeout(async () => {
      stats.totalOpened++;
      console.log(`👀 [${channel}] ${communicationId} → OPENED`);
      await fireCallback(callbackUrl, {
        communicationId,
        status: 'opened',
        timestamp: new Date().toISOString(),
      });

      // 30 % chance of a click after open
      const willClick = Math.random() < 0.3;
      if (!willClick) return;

      const clickDelay = randomDelay(0.5, 1.5);
      setTimeout(async () => {
        stats.totalClicked++;
        console.log(`🖱️  [${channel}] ${communicationId} → CLICKED`);
        await fireCallback(callbackUrl, {
          communicationId,
          status: 'clicked',
          timestamp: new Date().toISOString(),
        });
      }, clickDelay);
    }, openDelay);
  }, initialDelay);
}

// ────────────────────────────────────────────────────────────────────────────────
// Express app
// ────────────────────────────────────────────────────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json());

// ── POST /api/send ──────────────────────────────────────────────────────────

app.post('/api/send', (req: Request, res: Response): void => {
  const { communicationId, customerId, channel, message, callbackUrl } = req.body as Partial<SendRequest>;

  // Validate required fields
  if (!communicationId || !customerId || !channel || !message || !callbackUrl) {
    res.status(400).json({
      error: 'Missing required fields: communicationId, customerId, channel, message, callbackUrl',
    });
    return;
  }

  const validChannels: string[] = ['whatsapp', 'sms', 'email'];
  if (!validChannels.includes(channel)) {
    res.status(400).json({
      error: `Invalid channel "${channel}". Must be one of: ${validChannels.join(', ')}`,
    });
    return;
  }

  stats.totalReceived++;
  console.log(`📩 Received [${channel}] for customer ${customerId} — commId: ${communicationId}`);

  // Kick off the async simulation (does NOT block the response)
  simulateDelivery({ communicationId, customerId, channel, message, callbackUrl });

  // Immediately respond 202 Accepted
  res.status(202).json({ status: 'accepted', communicationId });
});

// ── GET /api/health ─────────────────────────────────────────────────────────

app.get('/api/health', (_req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    service: 'channel-service',
    uptime: process.uptime(),
  });
});

// ── GET /api/stats ──────────────────────────────────────────────────────────

app.get('/api/stats', (_req: Request, res: Response): void => {
  res.json(stats);
});

// ────────────────────────────────────────────────────────────────────────────────
// Start server
// ────────────────────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || '3002', 10);

app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log(`🚀 Channel Service running on http://localhost:${PORT}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('  POST /api/send    — accept a message for delivery');
  console.log('  GET  /api/health  — health check');
  console.log('  GET  /api/stats   — delivery statistics');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
});

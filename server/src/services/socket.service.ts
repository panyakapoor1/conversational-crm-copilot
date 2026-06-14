import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

/**
 * Socket.io Service — manages real-time WebSocket connections
 * for live campaign status updates pushed to the frontend.
 */

let io: SocketIOServer | null = null;

/**
 * Initialise Socket.io on the HTTP server with CORS configured
 * for the client application.
 */
export function initializeSocket(server: HTTPServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Allow clients to join a campaign-specific room for targeted updates
    socket.on('join-campaign', (campaignId: string) => {
      joinCampaignRoom(socket, campaignId);
    });

    socket.on('leave-campaign', (campaignId: string) => {
      socket.leave(`campaign:${campaignId}`);
      console.log(`[Socket] ${socket.id} left campaign room: ${campaignId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  console.log('[Socket] Socket.io initialised');
  return io;
}

/**
 * Returns the active Socket.io server instance.
 * Throws if called before initialisation.
 */
export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io has not been initialised — call initializeSocket first');
  }
  return io;
}

/**
 * Emit a campaign stats update to all clients watching a specific campaign.
 */
export function emitCampaignUpdate(
  campaignId: string,
  stats: {
    total: number;
    queued: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
  }
): void {
  if (!io) {
    console.warn('[Socket] Cannot emit — Socket.io not initialised');
    return;
  }
  io.to(`campaign:${campaignId}`).emit('campaign-update', {
    campaignId,
    stats,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Join a socket to a campaign-specific room for real-time updates.
 */
export function joinCampaignRoom(socket: Socket, campaignId: string): void {
  socket.join(`campaign:${campaignId}`);
  console.log(`[Socket] ${socket.id} joined campaign room: ${campaignId}`);
}

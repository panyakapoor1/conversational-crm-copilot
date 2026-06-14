import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';
let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL);
  }
  return socketInstance;
}

export function useCampaignUpdates(campaignId: string | undefined, onUpdate: (stats: any) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!campaignId) return;

    const socket = getSocket();
    socketRef.current = socket;

    // Join room
    socket.emit('join-campaign', campaignId);

    // Listen for updates
    const handleUpdate = (data: { campaignId: string, stats: any }) => {
      if (data.campaignId === campaignId) {
        onUpdate(data.stats);
      }
    };

    socket.on('campaign:stats-update', handleUpdate);

    return () => {
      socket.off('campaign:stats-update', handleUpdate);
      socket.emit('leave-campaign', campaignId);
    };
  }, [campaignId, onUpdate]);
}

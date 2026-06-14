import type { Customer, Segment, Campaign, CustomerStats, SegmentSuggestion, Communication } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export const api = {
  customers: {
    getAll: async (params?: Record<string, string>): Promise<{ customers: Customer[], total: number }> => {
      const qs = params ? new URLSearchParams(params).toString() : '';
      const res = await fetch(`${API_BASE}/customers${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch customers');
      return res.json();
    },
    getStats: async (): Promise<CustomerStats> => {
      const res = await fetch(`${API_BASE}/customers/stats`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    getById: async (id: string): Promise<Customer> => {
      const res = await fetch(`${API_BASE}/customers/${id}`);
      if (!res.ok) throw new Error('Failed to fetch customer');
      const data = await res.json();
      return data.customer;
    }
  },
  segments: {
    getAll: async (): Promise<Segment[]> => {
      const res = await fetch(`${API_BASE}/segments`);
      if (!res.ok) throw new Error('Failed to fetch segments');
      const data = await res.json();
      return data.segments || [];
    },
    getById: async (id: string): Promise<Segment> => {
      const res = await fetch(`${API_BASE}/segments/${id}`);
      if (!res.ok) throw new Error('Failed to fetch segment');
      const data = await res.json();
      return data.segment;
    },
    create: async (data: { naturalLanguageQuery: string }): Promise<Segment> => {
      const res = await fetch(`${API_BASE}/segments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create segment');
      const resData = await res.json();
      return resData.segment;
    },
    suggest: async (): Promise<SegmentSuggestion[]> => {
      const res = await fetch(`${API_BASE}/segments/suggest`, { method: 'POST' });
      if (!res.ok) return []; // Fallback so UI doesn't crash if AI fails
      const data = await res.json();
      return data.suggestions || [];
    },
    preview: async (data: { naturalLanguageQuery: string }): Promise<{ mongoQuery: string, estimatedCount: number }> => {
      const res = await fetch(`${API_BASE}/segments/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to preview segment');
      return res.json();
    }
  },
  campaigns: {
    getAll: async (): Promise<Campaign[]> => {
      const res = await fetch(`${API_BASE}/campaigns`);
      if (!res.ok) throw new Error('Failed to fetch campaigns');
      const data = await res.json();
      return data.campaigns || [];
    },
    getById: async (id: string): Promise<{ campaign: Campaign, communications: Communication[] }> => {
      const res = await fetch(`${API_BASE}/campaigns/${id}`);
      if (!res.ok) throw new Error('Failed to fetch campaign details');
      return res.json();
    },
    create: async (data: Partial<Campaign>): Promise<Campaign> => {
      const res = await fetch(`${API_BASE}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create campaign');
      const resData = await res.json();
      return resData.campaign;
    },
    send: async (id: string): Promise<{ status: string }> => {
      const res = await fetch(`${API_BASE}/campaigns/${id}/send`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to send campaign');
      return res.json();
    },
    getIntelligence: async (id: string): Promise<{ report: string }> => {
      const res = await fetch(`${API_BASE}/campaigns/${id}/intelligence`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to generate intelligence');
      return res.json();
    }
  },
  chat: {
    sendMessage: async (message: string, history: any[]): Promise<{ response: string, context: any }> => {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, conversationHistory: history })
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    }
  }
};

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/authStore';

export const useWebSocket = (projectId: string) => {
  const ws = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    // Connect to WebSocket server
    const connect = () => {
      const token = useAuthStore.getState().token;
      const wsBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL?.replace(/^http/, 'ws') || 'ws://localhost:8080/api/v1';
      const wsUrl = `${wsBaseUrl}/projects/${projectId}/ws${token ? `?token=${token}` : ''}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('Connected to project WebSocket');
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'TASK_UPDATED') {
            // Invalidate queries so React Query refetches the latest tasks
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
          }
        } catch (error) {
          console.error('Error parsing WS message', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected. Reconnecting in 3s...');
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.onclose = null; // Prevent reconnect on unmount
        ws.current.close();
      }
    };
  }, [projectId, queryClient]);
};

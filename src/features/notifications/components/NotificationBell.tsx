import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check } from 'lucide-react';
import { notificationApi } from '../api/notificationApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import { AnimatePresence, motion } from 'framer-motion';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const ws = useRef<WebSocket | null>(null);
  
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getMyNotifications(),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    const connect = () => {
      const token = useAuthStore.getState().token;
      if (!token) return;
      const wsUrl = `ws://localhost:8080/api/v1/users/ws?token=${token}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'NEW_NOTIFICATION') {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
          }
        } catch (error) {
          console.error('Error parsing WS message', error);
        }
      };

      ws.current.onclose = () => {
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
      }
    };
  }, [queryClient]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative grid h-8 w-8 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <Bell className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 grid h-2.5 w-2.5 place-items-center rounded-full bg-red-500 ring-2 ring-background">
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-white/20 glass p-4 text-sm shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>
            
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-xs">You're all caught up!</div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`flex flex-col gap-1 rounded-lg p-3 transition-colors cursor-pointer ${notif.is_read ? 'bg-muted/30 hover:bg-muted/50' : 'bg-primary/10 hover:bg-primary/20'}`}
                    onClick={() => {
                      if (!notif.is_read) markAsReadMutation.mutate(notif.id);
                    }}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className={`font-semibold text-xs ${notif.is_read ? 'text-foreground/80' : 'text-foreground'}`}>{notif.title}</span>
                      {!notif.is_read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1"></span>}
                    </div>
                    <p className={`text-xs ${notif.is_read ? 'text-muted-foreground' : 'text-foreground/90'}`}>{notif.detail}</p>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

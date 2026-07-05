import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Star, Settings, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CommandMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <Command.Dialog 
          open={open} 
          onOpenChange={setOpen} 
          label="Global Command Menu"
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-xl overflow-hidden rounded-xl border border-white/20 glass shadow-2xl bg-white dark:bg-zinc-900"
          >
            <div className="flex items-center border-b border-gray-200/50 px-3" cmdk-input-wrapper="">
              <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
              <Command.Input 
                autoFocus
                placeholder="Search projects, tasks, or jump to..." 
                className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white"
              />
            </div>
            
            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 text-sm">
              <Command.Empty className="py-6 text-center text-sm text-gray-500">
                No results found.
              </Command.Empty>

              <Command.Group heading="Navigation" className="p-2 text-xs font-medium text-gray-500">
                <Command.Item 
                  onSelect={() => { navigate('/'); setOpen(false); }}
                  className="flex cursor-pointer items-center rounded-md px-2 py-2 text-sm hover:bg-primary hover:text-white dark:text-gray-200 dark:hover:bg-blue-600 aria-selected:bg-primary aria-selected:text-white"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Workspace Dashboard
                </Command.Item>
                <Command.Item 
                  onSelect={() => { navigate('/starred'); setOpen(false); }}
                  className="flex cursor-pointer items-center rounded-md px-2 py-2 text-sm hover:bg-primary hover:text-white dark:text-gray-200 dark:hover:bg-blue-600 aria-selected:bg-primary aria-selected:text-white"
                >
                  <Star className="mr-2 h-4 w-4" />
                  Starred Items
                </Command.Item>
              </Command.Group>

              <Command.Group heading="Quick Actions" className="p-2 text-xs font-medium text-gray-500">
                <Command.Item 
                  onSelect={() => { navigate('/settings'); setOpen(false); }}
                  className="flex cursor-pointer items-center rounded-md px-2 py-2 text-sm hover:bg-primary hover:text-white dark:text-gray-200 dark:hover:bg-blue-600 aria-selected:bg-primary aria-selected:text-white"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </Command.Item>
              </Command.Group>
            </Command.List>
          </motion.div>
        </Command.Dialog>
      )}
    </AnimatePresence>
  );
};

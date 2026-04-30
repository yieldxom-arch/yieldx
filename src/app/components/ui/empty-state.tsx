import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4"
    >
      <div className="bg-slate-100 dark:bg-slate-800/50 rounded-full p-6 mb-4">
        <Icon className="w-12 h-12 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-center mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="bg-gradient-to-r from-[#4ECDC4] to-[#5DD9C1]">
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}

import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

export default function Toast({ notification }) {
  if (!notification) return null;

  const isSuccess = notification.type === 'success';

  return (
    <aside
      aria-label="Notification alert"
      className="fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-md text-xs font-medium bg-neutral-900 text-white border border-neutral-800 animate-in fade-in"
    >
      <div className="p-0.5 rounded-full bg-neutral-800 text-neutral-300">
        {isSuccess ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5 text-neutral-300" />}
      </div>
      <span className="pr-1">{notification.message}</span>
    </aside>
  );
}

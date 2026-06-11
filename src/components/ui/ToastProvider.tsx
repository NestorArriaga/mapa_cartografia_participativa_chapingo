import React from 'react';
import { useUiStore } from '../../stores/uiStore';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

export const ToastProvider: React.FC = () => {
  const { toasts, removeToast } = useUiStore();

  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none"
    >
      {toasts.map(toast => {
        const Icon = toast.type === 'success' ? CheckCircle2 :
                     toast.type === 'warning' ? AlertTriangle :
                     toast.type === 'error' ? XCircle : Info;
                     
        const color = toast.type === 'success' ? 'text-[#35D07F]' :
                      toast.type === 'warning' ? 'text-[#FBBF24]' :
                      toast.type === 'error' ? 'text-[#FF4D5E]' : 'text-[#D6A83A]';

        return (
          <div 
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 bg-[#030712]/95 backdrop-blur-md border border-[#D6A83A]/30 px-4 py-3 rounded-xl shadow-2xl animate-fade-in-up"
            style={{ minWidth: '280px' }}
          >
            <Icon size={18} className={color} />
            <span className="text-sm font-medium text-white flex-1">{toast.message}</span>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <XCircle size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

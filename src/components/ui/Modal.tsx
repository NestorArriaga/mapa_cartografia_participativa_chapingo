import React, { useEffect } from 'react';
import { GlassPanel } from './GlassPanel';
import { X } from 'lucide-react';
import { cn } from './GlassPanel';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
  hideClose?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className, hideClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <GlassPanel className={cn("relative w-full max-w-2xl max-h-[90vh] shadow-2xl", className)}>
        {!hideClose && onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-textMuted hover:text-white transition-colors z-10 p-1"
          >
            <X size={24} />
          </button>
        )}
        <div className="overflow-y-auto custom-scrollbar h-full w-full">
          {children}
        </div>
      </GlassPanel>
    </div>
  );
};

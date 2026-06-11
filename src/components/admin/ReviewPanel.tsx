import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { ReviewTable } from './ReviewTable';
import { AdminExportTools } from './AdminExportTools';

export const ReviewPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + R
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'r') {
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} hideClose={false} onClose={() => setIsOpen(false)} className="max-w-5xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Panel de Revisión Local (Admin)</h2>
            <p className="text-textSecondary text-sm">Gestiona las aportaciones pendientes y sensibles.</p>
          </div>
          <AdminExportTools />
        </div>
        <ReviewTable />
      </div>
    </Modal>
  );
};

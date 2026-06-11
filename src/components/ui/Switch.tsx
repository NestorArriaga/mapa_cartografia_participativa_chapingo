import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange }) => {
  return (
    <div 
      className={`relative w-8 h-4 rounded-full transition-colors ${checked ? 'bg-cyan-500' : 'bg-slate-700'}`}
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
    >
      <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
  );
};

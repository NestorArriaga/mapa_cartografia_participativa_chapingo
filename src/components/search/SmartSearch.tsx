import React from "react";
import { Search } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

export const SmartSearch: React.FC = () => {
  const searchQuery = useUIStore(s => s.searchQuery);
  const setSearchQuery = useUIStore(s => s.setSearchQuery);

  // Simple mock logic for UI, real implementation would index layer data
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
  };

  return (
    <div className="mb-5 relative z-20">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearch}
        placeholder="Buscar zona, nodo o categoría…"
        className="w-full bg-[rgba(15,23,42,0.6)] border border-white/10 rounded-full py-2 pl-9 pr-4 text-[13px] text-white placeholder:text-textMuted focus:outline-none focus:border-mapCyan/50 focus:ring-1 focus:ring-mapCyan/50 transition-all"
      />
    </div>
  );
};

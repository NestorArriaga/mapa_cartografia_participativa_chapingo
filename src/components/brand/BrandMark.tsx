import React from 'react';

export const BrandMark: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center w-12 h-12 ${className}`}>
      {/* Anillo Orbital Exterior */}
      <div className="absolute inset-0 border-2 border-dashed border-[#D6A83A]/30 rounded-full animate-[spin_20s_linear_infinite]" />
      
      {/* Anillo de Cuidado (Verde/Magenta) */}
      <div className="absolute inset-1 rounded-full border border-[#35D07F]/40" />
      <div className="absolute inset-2 rounded-full border border-[#F43F9D]/20 animate-pulse-slow" />

      {/* Punto Luminoso (Ruta) */}
      <div className="absolute w-2 h-2 bg-[#D6A83A] rounded-full top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_#D6A83A] animate-[spin_4s_ease-in-out_infinite]" />

      {/* Monograma */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <span className="text-sm font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#D6A83A] to-[#F43F9D]">
          MV
        </span>
      </div>

      {/* Micro-trazo hoja/brote */}
      <svg className="absolute -bottom-1 -right-1 w-4 h-4 text-[#35D07F]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2C12,2 5,6 5,14C5,18.8 8.4,22 12,22C15.6,22 19,18.8 19,14C19,6 12,2 12,2Z" opacity="0.8"/>
      </svg>
    </div>
  );
};

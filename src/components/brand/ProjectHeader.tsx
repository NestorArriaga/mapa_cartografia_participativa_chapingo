import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const ProjectHeader: React.FC = () => {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="text-2xl font-black text-white tracking-tight leading-none">
        Mapa Vivo
      </h1>
      <h2 className="text-lg font-bold text-[#D6A83A] tracking-wide leading-none">
        UACh–Texcoco
      </h2>
      <p className="text-xs text-[#9AA9BA] font-medium leading-relaxed max-w-xs mt-1">
        Cartografía participativa de movilidad, cuidado y alerta.
      </p>
      
      <div className="flex flex-wrap gap-2 mt-3">
        <Badge variant="filled" className="bg-[#0B1220] border border-[#35D07F]/40 text-[#35D07F]">
          <span className="flex items-center gap-1"><Shield size={10} /> Datos sanitizados</span>
        </Badge>
        <Badge variant="filled" className="bg-[#0B1220] border border-[#F43F9D]/30 text-[#F43F9D]">
          Modo público
        </Badge>
        <Badge variant="filled" className="bg-[#0B1220] border border-white/10 text-[#9AA9BA]">
          <span className="flex items-center gap-1"><Lock size={10} /> Sensibles protegidos</span>
        </Badge>
        <Badge variant="outline" className="border-white/10 text-white/50">
          v0.6
        </Badge>
      </div>
    </div>
  );
};

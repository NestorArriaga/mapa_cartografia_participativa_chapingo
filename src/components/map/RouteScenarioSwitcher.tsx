import React from "react";
import { MAPVIVO } from "../../lib/colorScales";
import { RouteProfile } from "../../services/intelligentRouteEngine";
import { Zap, Shield, GitMerge } from "lucide-react";

interface Props {
  currentProfile: RouteProfile;
  onChangeProfile: (profile: RouteProfile) => void;
}

export const RouteScenarioSwitcher: React.FC<Props> = ({ currentProfile, onChangeProfile }) => {
  return (
    <div className="flex bg-[#030712] rounded-xl p-1 border border-white/10 gap-1 w-full mt-4">
      <button
        onClick={() => onChangeProfile("directa")}
        className="flex-1 flex flex-col items-center justify-center p-2 rounded-lg transition-colors"
        style={{ background: currentProfile === "directa" ? "rgba(255,255,255,0.1)" : "transparent" }}
      >
        <Zap size={14} color={currentProfile === "directa" ? MAPVIVO.orangeRoute : MAPVIVO.mutedText} />
        <span className="text-[10px] font-bold mt-1" style={{ color: currentProfile === "directa" ? MAPVIVO.softWhite : MAPVIVO.mutedText }}>Directa</span>
      </button>

      <button
        onClick={() => onChangeProfile("balanceada")}
        className="flex-1 flex flex-col items-center justify-center p-2 rounded-lg transition-colors"
        style={{ background: currentProfile === "balanceada" ? "rgba(255,255,255,0.1)" : "transparent" }}
      >
        <GitMerge size={14} color={currentProfile === "balanceada" ? MAPVIVO.agriGreen : MAPVIVO.mutedText} />
        <span className="text-[10px] font-bold mt-1" style={{ color: currentProfile === "balanceada" ? MAPVIVO.softWhite : MAPVIVO.mutedText }}>Balanceada</span>
      </button>

      <button
        onClick={() => onChangeProfile("menor_exposicion")}
        className="flex-1 flex flex-col items-center justify-center p-2 rounded-lg transition-colors"
        style={{ background: currentProfile === "menor_exposicion" ? "rgba(255,255,255,0.1)" : "transparent" }}
      >
        <Shield size={14} color={currentProfile === "menor_exposicion" ? MAPVIVO.protectedGray : MAPVIVO.mutedText} />
        <span className="text-[10px] font-bold mt-1" style={{ color: currentProfile === "menor_exposicion" ? MAPVIVO.softWhite : MAPVIVO.mutedText }}>Menor Expos.</span>
      </button>
    </div>
  );
};

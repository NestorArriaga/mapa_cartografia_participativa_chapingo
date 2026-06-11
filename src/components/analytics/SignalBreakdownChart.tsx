import React from 'react';
import { MAPVIVO } from '../../lib/colorScales';

interface SignalData {
  category: string;
  count: number;
  color: string;
}

interface SignalBreakdownChartProps {
  data?: SignalData[];
}

export const SignalBreakdownChart: React.FC<SignalBreakdownChartProps> = ({ data }) => {
  // Default demo data if none provided
  const chartData = data || [
    { category: 'Documental', count: 142, color: MAPVIVO.magentaCare },
    { category: 'Infraestructura', count: 89, color: MAPVIVO.amberAttention },
    { category: 'Movilidad', count: 76, color: MAPVIVO.chapingoGold },
    { category: 'Participación', count: 54, color: MAPVIVO.leafSoft },
    { category: 'Memoria', count: 32, color: MAPVIVO.coralAlert }
  ];

  const maxCount = Math.max(...chartData.map(d => d.count));

  return (
    <div className="w-full mt-4">
      <h3 className="mv-section-title mb-3">Desglose de Señales</h3>
      <div className="flex flex-col gap-3">
        {chartData.map((item, index) => {
          const widthPercent = `${(item.count / maxCount) * 100}%`;
          return (
            <div key={index} className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[11px] font-semibold text-gray-300">
                <span className="uppercase tracking-wider">{item.category}</span>
                <span className="font-mono">{item.count}</span>
              </div>
              <div className="h-1.5 w-full bg-[#1A2235] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: widthPercent, backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';

export const ThemeFrequencyChart: React.FC = () => {
  const themes = [
    { theme: 'Iluminación y Seguridad', frequency: 84 },
    { theme: 'Redes de Cuidado', frequency: 65 },
    { theme: 'Movilidad Peatonal', frequency: 52 },
    { theme: 'Apropiación del Espacio', frequency: 38 }
  ];

  return (
    <div className="w-full mt-4">
      <h3 className="mv-section-title mb-3">Temáticas Recurrentes</h3>
      <div className="flex flex-col gap-2">
        {themes.map((t, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-xs text-gray-200">{t.theme}</span>
            <span className="text-sm font-mono text-white bg-white/10 px-2 py-0.5 rounded">{t.frequency}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

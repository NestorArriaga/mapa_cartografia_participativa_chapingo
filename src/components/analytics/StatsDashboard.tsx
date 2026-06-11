import React from "react";
import { BarChart3, TrendingUp, Users, Activity, Map } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useLayoutStore } from "../../stores/layoutStore";

const PRIORITY_DATA = [
  { name: "Boyeros", score: 85, fill: "#FF4D5E" },
  { name: "Estadio", score: 65, fill: "#FBBF24" },
  { name: "Prepa", score: 45, fill: "#D6A83A" },
  { name: "Biblioteca", score: 30, fill: "#35D07F" },
];

const SIGNAL_DATA = [
  { name: "Documental", value: 35, color: "#7EE2A8" },
  { name: "Cualitativa", value: 45, color: "#F43F9D" },
  { name: "Cuantitativa", value: 10, color: "#D6A83A" },
  { name: "Participativa", value: 10, color: "#A855F7" },
];

export const StatsDashboard: React.FC = () => {
  const { setShowDashboard } = useLayoutStore();

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] max-h-[80vh] overflow-y-auto glass-panel z-50 p-6 flex flex-col gap-6 animate-fade-in-up custom-scrollbar shadow-2xl" data-testid="stats-dashboard">
      
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <BarChart3 size={24} className="text-[#D6A83A]" />
          <div>
            <h2 className="title-font text-2xl font-bold text-white m-0 leading-tight">Métricas del Territorio</h2>
            <p className="text-sm text-gray-400 m-0">Observatorio de Movilidad Vivida</p>
          </div>
        </div>
        <button 
          onClick={() => setShowDashboard(false)}
          className="text-gray-400 hover:text-white bg-white/5 px-4 py-2 rounded-lg text-xs font-bold uppercase glass-button"
        >
          Cerrar
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard icon={Map} label="Zonas Activas" value="12" color="#D6A83A" />
        <MetricCard icon={Activity} label="Señales" value="145" color="#35D07F" />
        <MetricCard icon={Users} label="Aportaciones" value="89" color="#A855F7" />
        <MetricCard icon={TrendingUp} label="Rutas" value="4" color="#FB923C" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Priority Bar Chart */}
        <div className="bg-[#030712]/50 rounded-xl p-4 border border-white/5">
          <h3 className="title-font text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Prioridad por Zona</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PRIORITY_DATA} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#9AA9BA', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#030712', borderColor: '#333', borderRadius: '8px' }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                  {PRIORITY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Signal Breakdown Donut */}
        <div className="bg-[#030712]/50 rounded-xl p-4 border border-white/5">
          <h3 className="title-font text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Desglose de Señales</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SIGNAL_DATA}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {SIGNAL_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#030712', borderColor: '#333', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Tags Cloud Concept */}
      <div className="bg-[#030712]/50 rounded-xl p-4 border border-white/5">
        <h3 className="title-font text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Temas Frecuentes</h3>
        <div className="flex flex-wrap gap-2">
          {["Iluminación", "Acompañamiento", "Soledad", "Mantenimiento", "Ruta Larga", "Agua", "Vegetación Densa"].map((tag, i) => (
            <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300" style={{ opacity: 1 - (i*0.1) }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-[#030712]/50 rounded-xl p-4 border border-white/5 flex flex-col items-start gap-2">
    <Icon size={18} color={color} />
    <div>
      <div className="text-2xl font-bold text-white leading-none">{value}</div>
      <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mt-1">{label}</div>
    </div>
  </div>
);

export default StatsDashboard;

import React, { ReactNode } from 'react';

interface InfoCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  delay?: number;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, unit, icon, delay = 0 }) => {
  return (
    <div
      className="
        relative overflow-hidden
        backdrop-blur-[20px] saturate-[150%]
        bg-white/5
        border border-white/10 
        shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]
        p-6 rounded-3xl 
        transition-all duration-500
        hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] hover:shadow-[0_8px_40px_0_rgba(0,0,0,0.3)]
        flex flex-col justify-between h-40
        group
      "
      style={{ animationDelay: `${delay * 0.1}s` }}
    >

      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors duration-500 pointer-events-none"></div>

      <div className="flex items-center justify-between z-10">
        <div className="text-white/50 text-[10px] uppercase tracking-[0.25em] font-bold">{title}</div>
        <div className="text-white/80 p-2 bg-white/5 rounded-full border border-white/5">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-1 mt-auto z-10">
        <span className="text-4xl font-light text-white tracking-tight">
          {value}
        </span>
        {unit && <span className="text-sm text-white/40 font-medium mb-1 ml-1">{unit}</span>}
      </div>
    </div>
  );
};

export default InfoCard; 

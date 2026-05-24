import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion';

export const EHRIComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scanline = interpolate(frame % 90, [0, 90], [0, 100]);
  const opacity = interpolate(frame % 90, [0, 45, 90], [0.3, 0.8, 0.3]);
  const scale = spring({
    frame: frame % 120,
    fps,
    config: {
      damping: 12,
    },
  });

  return (
    <AbsoluteFill className="bg-[#0b1121] flex items-center justify-center p-8 font-sans overflow-hidden rounded-3xl shadow-2xl">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.3)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Radar Ping */}
      <div 
        className="absolute w-[300px] h-[300px] rounded-full border border-cyan-500/30"
        style={{ transform: `scale(${interpolate(frame % 60, [0, 60], [0, 2])})`, opacity: interpolate(frame % 60, [0, 60], [1, 0]) }}
      />
      <div 
        className="absolute w-[300px] h-[300px] rounded-full border border-cyan-500/10"
        style={{ transform: `scale(${interpolate((frame + 30) % 60, [0, 60], [0, 2])})`, opacity: interpolate((frame + 30) % 60, [0, 60], [1, 0]) }}
      />
      
      {/* Central Node */}
      <div 
        className="relative z-10 w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-500/50 backdrop-blur-md"
        style={{ transform: `scale(${1 + Math.sin(frame / 10) * 0.05})` }}
      >
        <div className="w-16 h-16 bg-blue-500 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center justify-center text-white font-bold text-sm tracking-widest">
          EHRI
        </div>
      </div>

      {/* Floating Data Points */}
      <div className="absolute top-1/4 left-1/4 bg-slate-800/80 p-3 rounded-xl border border-slate-700 backdrop-blur shadow-lg">
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">PM2.5 Level</div>
        <div className="text-xl font-bold text-white">42<span className="text-[10px] text-slate-500 ml-1">µg/m³</span></div>
        <div className="w-24 h-1 bg-slate-700 mt-2 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-500" style={{ width: '40%' }} />
        </div>
      </div>

      <div className="absolute bottom-1/4 right-1/4 bg-slate-800/80 p-3 rounded-xl border border-slate-700 backdrop-blur shadow-lg">
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Risk Score</div>
        <div className="text-xl font-bold text-emerald-400">Low</div>
        <div className="text-[10px] text-slate-400 mt-1">Systems Nominal</div>
      </div>

      {/* Scanner Line */}
      <div 
        className="absolute left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
        style={{ top: `${scanline}%`, opacity }}
      />
    </AbsoluteFill>
  );
};

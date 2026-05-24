"use client";

export const EHRIComposition = () => {
  return (
    <div className="relative aspect-square w-full overflow-hidden bg-[#0b1121] p-8 text-white shadow-2xl">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.3)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.14),_transparent_60%)]" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[300px] w-[300px] animate-ping rounded-full border border-cyan-500/30" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[300px] w-[300px] animate-pulse rounded-full border border-cyan-500/10" />
      </div>

      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-blue-500/50 bg-blue-600/20 backdrop-blur-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-sm font-bold tracking-widest text-white shadow-[0_0_30px_rgba(59,130,246,0.5)]">
            EHRI
          </div>
        </div>
      </div>

      <div className="absolute left-8 top-8 rounded-xl border border-slate-700 bg-slate-800/80 p-3 shadow-lg backdrop-blur">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">PM2.5 Level</div>
        <div className="text-xl font-bold text-white">
          42<span className="ml-1 text-[10px] text-slate-500">µg/m³</span>
        </div>
        <div className="mt-2 h-1 w-24 overflow-hidden rounded-full bg-slate-700">
          <div className="h-full w-[40%] bg-cyan-500" />
        </div>
      </div>

      <div className="absolute bottom-8 right-8 rounded-xl border border-slate-700 bg-slate-800/80 p-3 shadow-lg backdrop-blur">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Risk Score</div>
        <div className="text-xl font-bold text-emerald-400">Low</div>
        <div className="mt-1 text-[10px] text-slate-400">Systems Nominal</div>
      </div>

      <div className="absolute inset-y-0 left-0 right-0 animate-[ehri-scan_6s_linear_infinite]">
        <div className="h-[2px] w-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
      </div>
    </div>
  );
};

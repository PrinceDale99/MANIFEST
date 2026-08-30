import React from 'react';
import { motion } from 'framer-motion';
import { Truck, MapPin, ShieldCheck } from 'lucide-react';

const HUBS = [
  { id: 'la', name: 'Los Angeles', x: 15, y: 65, activeLoads: 14 },
  { id: 'sea', name: 'Seattle', x: 18, y: 20, activeLoads: 8 },
  { id: 'den', name: 'Denver', x: 42, y: 48, activeLoads: 11 },
  { id: 'chi', name: 'Chicago', x: 68, y: 38, activeLoads: 26 },
  { id: 'dal', name: 'Dallas', x: 52, y: 72, activeLoads: 19 },
  { id: 'atl', name: 'Atlanta', x: 76, y: 68, activeLoads: 15 },
  { id: 'nyc', name: 'New York', x: 88, y: 32, activeLoads: 32 },
];

const LANES = [
  { from: 'la', to: 'chi', duration: 4 },
  { from: 'chi', to: 'nyc', duration: 3 },
  { from: 'dal', to: 'atl', duration: 3.5 },
  { from: 'sea', to: 'den', duration: 4.5 },
  { from: 'den', to: 'chi', duration: 3.8 },
  { from: 'la', to: 'dal', duration: 4.2 },
  { from: 'atl', to: 'nyc', duration: 3.2 },
];

export default function RouteMapVisualizer() {
  const getHub = (id: string) => HUBS.find((h) => h.id === id)!;

  return (
    <div className="relative w-full aspect-[16/9] max-h-[380px] rounded-2xl glass-card border border-white/10 p-4 md:p-6 overflow-hidden shadow-2xl flex flex-col justify-between">
      {/* Background Cyber Grid */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(52, 211, 153, 0.4) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Header Overlay */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Live Encrypted Freight Lanes
          </span>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-200/80 border border-white/5 text-[11px] font-mono text-zinc-400">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
          <span>7 Interstates Secured</span>
        </div>
      </div>

      {/* SVG Canvas for Map & Connecting Animated Lanes */}
      <div className="relative flex-1 my-2">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Lane Paths */}
          {LANES.map((lane, index) => {
            const from = getHub(lane.from);
            const to = getHub(lane.to);
            return (
              <g key={`${lane.from}-${lane.to}`}>
                {/* Background Track */}
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="0.8"
                  strokeDasharray="2 2"
                />

                {/* Animated Glowing Packet Flow */}
                <motion.line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="url(#laneGradient)"
                  strokeWidth="1.2"
                  strokeDasharray="6 20"
                  animate={{ strokeDashoffset: [-50, 50] }}
                  transition={{
                    repeat: Infinity,
                    duration: lane.duration,
                    ease: 'linear',
                    delay: index * 0.4,
                  }}
                />
              </g>
            );
          })}

          {/* Gradients */}
          <defs>
            <linearGradient id="laneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="1" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Hub Nodes */}
          {HUBS.map((hub) => (
            <g key={hub.id} className="cursor-pointer group">
              {/* Outer Pulse */}
              <circle
                cx={hub.x}
                cy={hub.y}
                r="3"
                className="fill-emerald-400/20 animate-pulse"
              />
              {/* Center Dot */}
              <circle
                cx={hub.x}
                cy={hub.y}
                r="1.2"
                className="fill-emerald-400"
              />
            </g>
          ))}
        </svg>

        {/* HTML Labels Over SVG for crisp typography */}
        {HUBS.map((hub) => (
          <div
            key={`label-${hub.id}`}
            style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-6 pointer-events-none whitespace-nowrap"
          >
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-100/90 border border-white/10 text-[9px] font-mono text-zinc-300 shadow-md">
              <span className="font-semibold text-white">{hub.name}</span>
              <span className="text-emerald-400">({hub.activeLoads})</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-2 border-t border-white/5">
        <span>Active Bidding: 126 Bids</span>
        <span className="text-emerald-400">Avg Settlement: &lt; 2.4s</span>
      </div>
    </div>
  );
}

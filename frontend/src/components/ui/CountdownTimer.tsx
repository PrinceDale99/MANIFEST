import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  deadline: number | bigint | string;
  prefix?: string;
  onExpire?: () => void;
  compact?: boolean;
}

export default function CountdownTimer({ deadline, prefix = 'Closes in', onExpire, compact = false }: CountdownTimerProps) {
  const targetMs = typeof deadline === 'bigint' ? Number(deadline) : new Date(deadline).getTime();
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const diff = targetMs - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) onExpire();
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetMs, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-xs font-mono text-zinc-400">
        <Clock className="h-3.5 w-3.5 text-zinc-500" />
        Phase Ended
      </span>
    );
  }

  const isUrgent = timeLeft.hours < 2;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono text-xs ${
          isUrgent ? 'text-amber-400 animate-pulse' : 'text-zinc-300'
        }`}
      >
        <Clock className="h-3 w-3" />
        {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m :{' '}
        {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-colors ${
        isUrgent
          ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          : 'bg-surface-100 border-white/10 text-zinc-200'
      }`}
    >
      <Clock className={`h-3.5 w-3.5 ${isUrgent ? 'text-amber-400 animate-spin' : 'text-cyan-400'}`} style={{ animationDuration: '6s' }} />
      <span className="text-zinc-400">{prefix}:</span>
      <span className="font-bold text-white tracking-wider">
        {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m{' '}
        {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    </div>
  );
}

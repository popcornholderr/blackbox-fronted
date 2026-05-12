"use client";
import { useEffect, useState } from "react";

export default function IntroScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 400);
    const t2 = setTimeout(() => setPhase('out'), 1600);
    const t3 = setTimeout(() => onFinish(), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black overflow-hidden"
      style={{
        opacity: phase === 'out' ? 0 : 1,
        transition: phase === 'out' ? 'opacity 0.55s cubic-bezier(0.4,0,0.2,1)' : 'none',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(250,201,246,0.07) 0%, transparent 70%)',
          opacity: phase === 'hold' ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />
      <h1
        className="text-4xl font-black tracking-tighter select-none text-white"
        style={{
          opacity: phase === 'in' ? 0 : 1,
          transform: phase === 'in' ? 'scale(0.85)' : 'scale(1)',
          transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        B<span style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>L</span>ACK BOX
      </h1>
    </div>
  );
}

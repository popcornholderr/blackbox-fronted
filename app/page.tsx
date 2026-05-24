"use client";

import { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import {
  Search, Flame, Plus, X, Copy, Heart, ThumbsDown,
  BarChart2, Users, ChevronRight, Check,
  Lock, ShieldAlert,
} from 'lucide-react';
import RoomTile from '@/components/RoomTile';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import IntroScreen from '@/components/IntroScreen';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function formatTime(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ── Filter types — now a SET for multi-select ── */
type RoomFilter = 'public' | 'private' | 'safe' | 'adult';

/* ── ANIMATED BLURB ── */
function AnimatedBlurb({ onReadMore }: { onReadMore: () => void }) {
  const words = ['Anonymous.', 'Unfiltered.', 'For students.'];
  const [wi, setWi] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setWi(p => (p + 1) % words.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="rounded-2xl border border-white/10 px-4 py-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#0d0d0d 0%,#111 100%)' }}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(250,201,246,0.07) 50%, transparent 100%)' }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-[#fac9f6]"
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Anonymous Platform</span>
        </div>
        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
          <span className="text-sm font-black uppercase italic tracking-tight text-white leading-tight">Gossip freely.</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={wi}
              initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.35 }}
              className="text-sm font-black uppercase italic tracking-tight"
              style={{ color: '#fac9f6' }}
            >
              {words[wi]}
            </motion.span>
          </AnimatePresence>
        </div>
        <p className="text-[10px] text-white/35 leading-relaxed font-medium">
          For college &amp; school students — no accounts, no identity, no judgment.
        </p>
        <button
          onClick={onReadMore}
          className="mt-2 inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#fac9f6] tracking-widest"
        >
          <span>Read more</span>
          <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>→</motion.span>
        </button>
      </div>
    </div>
  );
}

/* ── INTRO primitives ── */
const Cursor = () => (
  <motion.span
    className="inline-block w-[1.5px] h-[0.85em] bg-white/60 ml-[1px] align-middle"
    animate={{ opacity: [1, 0, 1] }}
    transition={{ duration: 0.85, repeat: Infinity }}
  />
);

const LiveDot = ({ color = '#ef4444' }: { color?: string }) => (
  <motion.span
    className="inline-block rounded-full shrink-0"
    style={{ width: 6, height: 6, background: color }}
    animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
    transition={{ duration: 1.4, repeat: Infinity }}
  />
);

const IntroCard = forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string; style?: React.CSSProperties }>(
  ({ children, className = '', style = {} }, ref) => (
    <div
      ref={ref}
      className={`relative w-full rounded-[2rem] overflow-hidden border border-white/10 p-5 ${className}`}
      style={{ background: '#0a0a0a', ...style }}
    >
      {children}
    </div>
  )
);
IntroCard.displayName = 'IntroCard';

const SectionLabel = ({ text }: { text: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -20px 0px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-3 px-2 mb-5 mt-8"
    >
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">{text}</span>
      <div className="h-px flex-1 bg-white/10" />
    </motion.div>
  );
};

function PosterCreateRoom({ onCreateRoom }: { onCreateRoom: () => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '0px 0px -40px 0px' });
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!inView) { setStep(0); setCopied(false); return; }
    const ts = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1500),
      setTimeout(() => setStep(3), 2300),
      setTimeout(() => setStep(4), 3000),
      setTimeout(() => setCopied(true), 3200),
      setTimeout(() => setStep(5), 3800),
    ];
    return () => ts.forEach(clearTimeout);
  }, [inView]);

  return (
    <IntroCard ref={ref as any}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#fac9f6]">Step 1</span>
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">— Create a Room</span>
      </div>
      <div className="rounded-[1.4rem] border-2 border-white/10 overflow-hidden" style={{ background: '#111' }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <span className="text-base font-black italic uppercase text-white">Create Room</span>
          <div className="w-6 h-6 flex items-center justify-center rounded-full border border-white/10"><X size={12} className="text-white/50" /></div>
        </div>
        <div className="px-5 pb-5 flex flex-col gap-3">
          <div>
            <p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1.5">Room Title</p>
            <div className="rounded-2xl border-2 border-black px-4 py-3 bg-black">
              <span className="text-sm font-bold text-white">
                {step >= 1 ? <>E.g. Library Gossips{step < 2 ? <Cursor /> : null}</> : <span className="text-white/20">E.g. Library Gossips</span>}
              </span>
            </div>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1.5">Theme Color</p>
            {step >= 2
              ? <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.4 }} className="origin-left h-10 rounded-xl" style={{ background: '#22c55e' }} />
              : <div className="h-10 rounded-xl bg-white/5" />}
          </div>
          {step >= 3 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-[9px] font-black uppercase text-red-500 tracking-widest mb-1.5">Do not forget to copy the link</p>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 bg-white/[0.04]">
                <span className="text-[9px] font-mono text-white/50 flex-1 break-all">blackbox-omega-peach.vercel.app/room/library-gossips</span>
                <motion.div animate={step >= 4 ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
                  {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} className="text-white/40" />}
                </motion.div>
              </div>
            </motion.div>
          )}
          <div
            className="w-full py-3.5 rounded-2xl text-center text-xs font-black uppercase tracking-widest"
            style={{ background: step >= 5 ? 'white' : 'rgba(255,255,255,0.2)', color: step >= 5 ? 'black' : 'rgba(255,255,255,0.3)', transition: 'all 0.4s' }}
          >
            {step >= 5 ? <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Create ✓</motion.span> : 'Create'}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-white/35 mt-3 leading-relaxed">
        Go to <span className="text-[#fac9f6] font-black">Saved</span> tab → tap <span className="text-[#fac9f6] font-black">+</span> → name, color, copy link.
      </p>
      <button onClick={onCreateRoom} className="mt-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#fac9f6]">
        <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.1, repeat: Infinity }}>→</motion.span> Create your first room
      </button>
    </IntroCard>
  );
}

function PosterNewDrop() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '0px 0px -40px 0px' });
  const [step, setStep] = useState(0);
  const fullText = 'The canteen food today was lowkey fire ngl 🔥';
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!inView) { setStep(0); setTyped(''); return; }
    const ts = [setTimeout(() => setStep(1), 400), setTimeout(() => setStep(2), 1100), setTimeout(() => setStep(3), 3200)];
    return () => ts.forEach(clearTimeout);
  }, [inView]);

  useEffect(() => {
    if (step < 2) { setTyped(''); return; }
    let i = 0;
    const iv = setInterval(() => { i++; setTyped(fullText.slice(0, i)); if (i >= fullText.length) clearInterval(iv); }, 38);
    return () => clearInterval(iv);
  }, [step]);

  return (
    <IntroCard ref={ref as any}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#4ade80]">Step 2</span>
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">— Drop a Message</span>
      </div>
      <div className="rounded-[1.4rem] border-2 border-white/10 overflow-hidden" style={{ background: '#111' }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <span className="text-base font-black italic uppercase text-white">New Drop</span>
          <div className="w-6 h-6 flex items-center justify-center rounded-full border border-white/10"><X size={12} className="text-white/50" /></div>
        </div>
        <div className="px-5 pb-5 flex flex-col gap-3">
          <div className="rounded-2xl border border-white/10 px-4 py-3 bg-white/[0.04]">
            <span className="text-sm text-white/40">
              {step >= 1
                ? <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/70">Anonymous{step < 2 ? <Cursor /> : null}</motion.span>
                : 'Display Name...'}
            </span>
          </div>
          <div className="rounded-2xl border border-white/10 px-4 py-3 min-h-[80px] flex flex-col justify-between bg-white/[0.04]">
            <span className="text-sm text-white/80 leading-snug break-words">
              {typed || <span className="text-white/20">What&apos;s the tea?</span>}
              {step >= 2 && typed.length < fullText.length && <Cursor />}
            </span>
            {step >= 2 && <span className="text-[9px] text-white/20 text-right mt-1">{typed.length}/400</span>}
          </div>
          <div
            className="w-full py-3.5 rounded-2xl text-center text-xs font-black uppercase tracking-widest"
            style={{ background: step >= 3 ? 'white' : 'rgba(255,255,255,0.15)', color: step >= 3 ? 'black' : 'rgba(255,255,255,0.3)', transition: 'all 0.4s' }}
          >
            {step >= 3 ? <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Drop It ✓</motion.span> : 'Drop It'}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-white/35 mt-3 leading-relaxed">
        Open any room → tap <span className="text-[#4ade80] font-black">+</span> → type freely. No account needed.
      </p>
    </IntroCard>
  );
}

function PosterModeration() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '0px 0px -40px 0px' });
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState('');
  const bad = 'fuck';

  useEffect(() => {
    if (!inView) { setStep(0); setTyped(''); return; }
    const ts = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 900),
      setTimeout(() => setStep(3), 2000),
      setTimeout(() => setStep(4), 2700),
    ];
    return () => ts.forEach(clearTimeout);
  }, [inView]);

  useEffect(() => {
    if (step < 2) { setTyped(''); return; }
    let i = 0;
    const iv = setInterval(() => { i++; setTyped(bad.slice(0, i)); if (i >= bad.length) clearInterval(iv); }, 90);
    return () => clearInterval(iv);
  }, [step]);

  const blocked = step >= 3;

  return (
    <IntroCard ref={ref as any}>
      <motion.div
        className="absolute inset-x-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, #ef4444 50%, transparent 100%)', opacity: 0.3 }}
        animate={{ top: ['8%', '92%', '8%'] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#f87171]">Always On</span>
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">— AI Shield</span>
          <div className="ml-auto flex items-center gap-1.5">
            <LiveDot color="#ef4444" />
            <span className="text-[8px] font-black uppercase text-white/25">Active</span>
          </div>
        </div>
        <div className="rounded-[1.4rem] border-2 border-white/10 overflow-hidden" style={{ background: '#111' }}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <span className="text-base font-black italic uppercase text-white">New Drop</span>
            <div className="w-6 h-6 flex items-center justify-center rounded-full border border-white/10"><X size={12} className="text-white/50" /></div>
          </div>
          <div className="px-5 pb-5 flex flex-col gap-3">
            <div className="rounded-2xl border border-white/10 px-4 py-3 bg-white/[0.04]">
              <span className="text-sm text-white/40">Display Name...</span>
            </div>
            <motion.div
              animate={{ borderColor: blocked ? 'rgb(239,68,68)' : 'rgba(255,255,255,0.1)' }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border px-4 py-3 min-h-[72px] flex flex-col justify-between bg-white/[0.04]"
            >
              <span className="text-sm leading-snug break-words" style={{ color: blocked ? '#f87171' : 'rgba(255,255,255,0.8)' }}>
                {step >= 2 ? typed : <span className="text-white/20">What&apos;s the tea?</span>}
                {step >= 2 && step < 3 && typed.length < bad.length && <Cursor />}
              </span>
              {step >= 2 && <span className="text-[9px] text-white/20 text-right mt-1">{typed.length}/400</span>}
            </motion.div>
            <AnimatePresence>
              {blocked && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[9px] font-black uppercase text-red-500 tracking-widest -mt-1">
                  Abusive language is not allowed.
                </motion.p>
              )}
            </AnimatePresence>
            <div className="w-full py-3.5 rounded-2xl text-center text-xs font-black uppercase tracking-widest bg-white text-black">Drop It</div>
          </div>
        </div>
        {step >= 4 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-2 mt-3">
            <div className="rounded-xl p-3 border border-red-500/20 bg-red-500/[0.06]">
              <p className="text-[8px] font-black uppercase text-red-400/60 mb-2">Blocked ✗</p>
              {['Slurs', 'Hate speech', 'Threats', '400+ patterns'].map((w, i) => (
                <motion.div key={w} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }} className="mb-1">
                  <span className="text-[8px] text-red-400/80 line-through">{w}</span>
                </motion.div>
              ))}
            </div>
            <div className="rounded-xl p-3 border border-green-500/20 bg-green-500/[0.05]">
              <p className="text-[8px] font-black uppercase text-green-400/60 mb-2">Allowed ✓</p>
              {['Honest rants', 'Opinions', 'Criticism', 'Emojis 🔥'].map((w, i) => (
                <motion.div key={w} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.08 }} className="mb-1">
                  <span className="text-[8px] text-green-400/80">{w}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        <p className="text-[10px] text-white/35 mt-3 leading-relaxed">
          Every drop scanned against <span className="text-[#f87171] font-black">400+ abuse patterns</span>. Toxic content rejected before reaching the feed.
        </p>
      </div>
    </IntroCard>
  );
}

function PosterPolls() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '0px 0px -40px 0px' });
  const [step, setStep] = useState(0);
  const options = ['Library rooftop 🌆', 'Canteen corner 🍕', 'Basketball court 🏀', 'Park outside 🌿'];
  const votes = [12, 8, 5, 3];
  const total = 28;

  useEffect(() => {
    if (!inView) { setStep(0); return; }
    const ts = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 2000),
      setTimeout(() => setStep(4), 2800),
    ];
    return () => ts.forEach(clearTimeout);
  }, [inView]);

  return (
    <IntroCard ref={ref as any}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 size={12} className="text-[#a78bfa]" />
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#a78bfa]">Step 3</span>
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">— Create a Poll</span>
      </div>
      <div className="rounded-[1.4rem] border border-white/10 p-4" style={{ background: '#111' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center"><BarChart2 size={12} className="text-[#a78bfa]" /></div>
          <span className="text-[10px] font-black uppercase text-white/60">Anonymous</span>
          <span className="ml-auto text-[8px] text-white/25">Just now</span>
        </div>
        {step >= 1 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-bold text-white/90 mb-3">Best place to hang after school?</motion.p>}
        <div className="flex flex-col gap-2">
          {options.map((opt, i) => {
            const pct = step >= 4 ? Math.round((votes[i] / total) * 100) : 0;
            const sel = i === 0 && step >= 3;
            return (
              <div key={i} className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
                {step >= 4 && (
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-xl"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    style={{ background: sel ? 'rgba(167,139,250,0.25)' : 'rgba(255,255,255,0.06)' }}
                  />
                )}
                <div className="relative px-3 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {step >= 3 && <div className={`w-3.5 h-3.5 rounded-full border-2 ${sel ? 'border-[#a78bfa] bg-[#a78bfa]' : 'border-white/20'}`} />}
                    <span className="text-[11px] text-white/80">{step >= 2 ? opt : <span className="text-white/20">Option {i + 1}</span>}</span>
                  </div>
                  {step >= 4 && <span className="text-[9px] font-black text-white/40">{pct}%</span>}
                </div>
              </div>
            );
          })}
        </div>
        {step >= 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-3">
            <Users size={10} className="text-white/30" />
            <span className="text-[9px] text-white/30 font-bold">{total} votes</span>
          </motion.div>
        )}
      </div>
      <p className="text-[10px] text-white/35 mt-3 leading-relaxed">
        Tap <span className="text-[#a78bfa] font-black">+</span> → choose <span className="text-[#a78bfa] font-black">Poll</span> → add question + up to 4 options. Results show live.
      </p>
    </IntroCard>
  );
}

function PosterAdultRoom() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '0px 0px -40px 0px' });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView) { setStep(0); return; }
    const ts = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 2000),
    ];
    return () => ts.forEach(clearTimeout);
  }, [inView]);

  return (
    <IntroCard ref={ref as any}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#f87171]">New</span>
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">— 18+ Rooms</span>
        <div className="ml-auto px-2 py-0.5 rounded-lg text-[9px] font-black bg-red-500/80 text-white">18+</div>
      </div>
      <div className="rounded-[1.4rem] border border-white/10 p-4 mb-3" style={{ background: '#111' }}>
        <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mb-3">Room Type</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: '🛡️ Safe Room', sub: 'Words filtered', color: '#4ade80', active: step < 2 },
            { label: '🔞 18+ Room', sub: 'Unfiltered chat', color: '#f87171', active: step >= 2 },
          ].map((opt, i) => (
            <motion.div
              key={i}
              animate={{ borderColor: opt.active ? opt.color + '80' : 'rgba(255,255,255,0.08)' }}
              className="rounded-xl border p-3 flex flex-col gap-1"
              style={{ background: opt.active ? opt.color + '10' : 'rgba(255,255,255,0.03)' }}
            >
              <span className="text-sm">{opt.label}</span>
              <span className="text-[9px] text-white/40 font-bold">{opt.sub}</span>
              {opt.active && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3 h-3 rounded-full mt-1" style={{ background: opt.color }} />}
            </motion.div>
          ))}
        </div>
        {step >= 2 && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
            <p className="text-[9px] font-black text-yellow-400/80 uppercase tracking-widest mb-1">⚠️ 18+ rooms</p>
            <p className="text-[9px] text-white/35 leading-relaxed">Adult language allowed. CSAM and terrorism content always blocked regardless of room type.</p>
          </motion.div>
        )}
      </div>
      <p className="text-[10px] text-white/35 leading-relaxed">
        <span className="text-[#fac9f6] font-black">18+ rooms</span> show a red badge on the room tile. Safe rooms filter 400+ abusive patterns.
      </p>
    </IntroCard>
  );
}

function PosterPrivateRoom() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '0px 0px -40px 0px' });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView) { setStep(0); return; }
    const ts = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1400),
      setTimeout(() => setStep(3), 2200),
      setTimeout(() => setStep(4), 3000),
    ];
    return () => ts.forEach(clearTimeout);
  }, [inView]);

  return (
    <IntroCard ref={ref as any}>
      <div className="flex items-center gap-2 mb-4">
        <Lock size={12} className="text-[#60a5fa]" />
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#60a5fa]">New</span>
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">— Private Rooms</span>
      </div>
      <div className="rounded-[1.4rem] border border-white/10 overflow-hidden mb-3" style={{ background: '#111' }}>
        <div className="px-4 py-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#60a5fa]/10 border border-[#60a5fa]/20 flex items-center justify-center">
            <Lock size={14} className="text-[#60a5fa]" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase text-white/80">Secret Room</p>
            <p className="text-[9px] text-white/30">Private · Invite only</p>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-2">
          {step >= 1 && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-[#60a5fa]/20 bg-[#60a5fa]/5 p-3">
              <p className="text-[9px] font-black uppercase text-[#60a5fa]/70 mb-1">Enter Admin Code</p>
              <div className="flex gap-1.5">
                {['•', '•', '•', '•'].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 text-sm font-black">{step >= 2 ? '•' : ''}</div>
                ))}
              </div>
            </motion.div>
          )}
          {step >= 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-[9px] text-white/30 font-bold uppercase tracking-widest">— or —</motion.div>
          )}
          {step >= 2 && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[9px] font-black uppercase text-white/40 mb-1">Request to Join</p>
              <div className="rounded-lg bg-black px-3 py-2 text-[10px] text-white/50 font-bold">
                {step >= 3 ? 'Alex' : <span className="text-white/20">Your name...</span>}
                {step === 3 && <Cursor />}
              </div>
            </motion.div>
          )}
          {step >= 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full py-2.5 rounded-xl text-center text-[10px] font-black uppercase tracking-wider bg-white text-black">
              Request Sent ✓
            </motion.div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { icon: '👑', label: 'Admin', desc: 'Enter code → see & approve/deny requests' },
          { icon: '👤', label: 'Member', desc: 'Request with name → wait for approval' },
        ].map((item, i) => (
          <div key={i} className="rounded-xl p-3 border border-white/8 bg-white/[0.03]">
            <span className="text-base">{item.icon}</span>
            <p className="text-[10px] font-black text-white/70 mt-1">{item.label}</p>
            <p className="text-[8px] text-white/30 leading-relaxed mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-white/35 leading-relaxed">
        Private rooms show a <span className="text-[#60a5fa] font-black">🔒 lock badge</span> on the tile. The admin code is set at room creation — share it only with trusted people.
      </p>
    </IntroCard>
  );
}

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
};

/* ── Filter chip — multi-select version ── */
function FilterChip({
  active, onClick, icon, label, activeColor, activeBg, activeBorder,
}: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
  activeColor: string; activeBg: string; activeBorder: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all shrink-0 active:scale-95"
      style={{
        borderColor: active ? activeBorder : 'rgba(255,255,255,0.1)',
        background: active ? activeBg : 'rgba(255,255,255,0.04)',
        color: active ? activeColor : 'rgba(255,255,255,0.4)',
      }}
    >
      {icon}
      <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
      {active && <span className="w-1.5 h-1.5 rounded-full ml-0.5 shrink-0" style={{ background: activeColor }} />}
    </button>
  );
}

const FILTER_CHIPS = [
  {
    key: 'public' as RoomFilter,
    label: 'Public',
    icon: (
      <svg width="10" height="9" viewBox="0 0 10 9" fill="none">
        <circle cx="5" cy="4.5" r="3.6" stroke="currentColor" strokeWidth="1.1" fill="none"/>
        <path d="M5 0.9C5 0.9 3 2.5 3 4.5s2 3.6 2 3.6" stroke="currentColor" strokeWidth="0.9" fill="none"/>
        <path d="M5 0.9C5 0.9 7 2.5 7 4.5s-2 3.6-2 3.6" stroke="currentColor" strokeWidth="0.9" fill="none"/>
        <line x1="1.4" y1="4.5" x2="8.6" y2="4.5" stroke="currentColor" strokeWidth="0.9"/>
      </svg>
    ),
    activeColor: '#fac9f6', activeBg: 'rgba(250,201,246,0.08)', activeBorder: 'rgba(250,201,246,0.35)',
  },
  {
    key: 'private' as RoomFilter,
    label: 'Private',
    icon: (
      <svg width="9" height="10" viewBox="0 0 9 10" fill="none">
        <rect x="1" y="4" width="7" height="5.5" rx="1.6" stroke="currentColor" strokeWidth="1.1" fill="none"/>
        <path d="M2.8 4V3C2.8 1.9 6.2 1.9 6.2 3v1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>
    ),
    activeColor: '#93c5fd', activeBg: 'rgba(96,165,250,0.08)', activeBorder: 'rgba(96,165,250,0.35)',
  },
  {
    key: 'safe' as RoomFilter,
    label: 'Safe',
    icon: (
      <svg width="9" height="10" viewBox="0 0 9 10" fill="none">
        <path d="M4.5 0.8L8.2 2.4V5.6C8.2 7.7 6.6 9.1 4.5 9.7 2.4 9.1 0.8 7.7 0.8 5.6V2.4L4.5 0.8z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" fill="none"/>
        <path d="M2.9 5l1.1 1.1 2.1-2.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    activeColor: '#86efac', activeBg: 'rgba(74,222,128,0.08)', activeBorder: 'rgba(74,222,128,0.35)',
  },
  {
    key: 'adult' as RoomFilter,
    label: '18+',
    icon: (
      <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
        <rect x="0.6" y="0.6" width="11.8" height="8.8" rx="2.4" stroke="currentColor" strokeWidth="1" fill="none"/>
        <text x="6.5" y="7.8" textAnchor="middle" fontSize="5.5" fontWeight="900" fill="currentColor" fontFamily="system-ui,sans-serif">18+</text>
      </svg>
    ),
    activeColor: '#f87171', activeBg: 'rgba(239,68,68,0.08)', activeBorder: 'rgba(239,68,68,0.35)',
  },
];

function FilterChipRow({ activeFilters, onToggle }: { activeFilters: Set<RoomFilter>; onToggle: (f: RoomFilter) => void }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
      {FILTER_CHIPS.map(chip => (
        <FilterChip
          key={chip.key}
          active={activeFilters.has(chip.key)}
          onClick={() => onToggle(chip.key)}
          icon={chip.icon}
          label={chip.label}
          activeColor={chip.activeColor}
          activeBg={chip.activeBg}
          activeBorder={chip.activeBorder}
        />
      ))}
    </div>
  );
}

function applyFilters(rooms: any[], activeFilters: Set<RoomFilter>): any[] {
  if (activeFilters.size === 0) return rooms;
  return rooms.filter(r => {
    const wantsPublic = activeFilters.has('public');
    const wantsPrivate = activeFilters.has('private');
    const wantsSafe = activeFilters.has('safe');
    const wantsAdult = activeFilters.has('adult');
    const visibilityMatch = (!wantsPublic && !wantsPrivate) || (wantsPublic && !r.isPrivate) || (wantsPrivate && r.isPrivate);
    const contentMatch = (!wantsSafe && !wantsAdult) || (wantsSafe && !r.isAdult) || (wantsAdult && r.isAdult);
    return visibilityMatch && contentMatch;
  });
}

function filterLabel(activeFilters: Set<RoomFilter>): string {
  if (activeFilters.size === 0) return 'All Rooms';
  const parts: string[] = [];
  if (activeFilters.has('public')) parts.push('Public');
  if (activeFilters.has('private')) parts.push('Private');
  if (activeFilters.has('safe')) parts.push('Safe');
  if (activeFilters.has('adult')) parts.push('18+');
  return parts.join(' · ') + ' Rooms';
}

/* ─────────────────────────────────────────────────────────────
   HOME PAGE — default export required by Next.js
   Intro shown only on first-ever visit (localStorage gate).
   Back-navigation from a room never triggers the intro because
   IntroScreen lives here, not in AppGuard or the room page.
───────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [showIntro, setShowIntro] = useState(false);
  const [mounted, setMounted] = useState(false);

  // All the rest of the home state
  const [currentIndex, setCurrentIndex] = useState(1);
  const [direction, setDirection] = useState(0);

  const [rooms, setRooms] = useState<any[]>([]);
  const [roomsLoaded, setRoomsLoaded] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [lastSeenMap, setLastSeenMap] = useState<any>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<RoomFilter>>(new Set());

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    title: '', color: '#22c55e', isAdult: false, isPrivate: false, adminCode: '',
  });
  const [fetchError, setFetchError] = useState(false);
  const [bestDrop, setBestDrop] = useState<any>(null);
  const [bestPoll, setBestPoll] = useState<any>(null);
  const [copiedCreate, setCopiedCreate] = useState(false);

  // Tracks whether the initial tab/scroll restore from sessionStorage has been applied
  const scrollRestoredRef = useRef(false);

  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFetchingRef = useRef(false);
  const roomsRef = useRef<HTMLDivElement>(null);
  const dragStartXRef = useRef(0);

  const toggleFilter = (f: RoomFilter) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  const paginate = (newIndex: number) => {
    setDirection(newIndex > currentIndex ? 1 : -1);
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery('');
    setActiveFilters(new Set());
  }, [currentIndex]);

  // ── Restore tab + scroll when user comes back from a room ──
  // We read both the saved tab index and the scroll position that were
  // written by markRoomSeen() (or handleBack() in the room page).
  // The scroll restore is deferred until AFTER the correct tab is
  // rendered, using a ref flag so it fires exactly once per navigation.
  useEffect(() => {
    if (!mounted) return;
    if (scrollRestoredRef.current) return;

    const savedTab = sessionStorage.getItem('returnTab');
    const savedScroll = sessionStorage.getItem('returnScrollY');

    if (!savedTab && !savedScroll) return;

    sessionStorage.removeItem('returnTab');
    sessionStorage.removeItem('returnScrollY');

    const tabIndex = savedTab ? parseInt(savedTab, 10) : 1;

    // Switch to the correct tab first (no animation direction needed for a restore)
    setDirection(0);
    setCurrentIndex(tabIndex);

    if (savedScroll) {
      const target = parseInt(savedScroll, 10);
      // Wait for the slide animation + layout to settle, then restore scroll
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          window.scrollTo({ top: target, behavior: 'instant' });
          scrollRestoredRef.current = true;
        });
        return raf2;
      });
      return () => cancelAnimationFrame(raf1);
    }

    scrollRestoredRef.current = true;
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
    const saved = JSON.parse(localStorage.getItem('savedRooms') || '[]');
    const av = parseInt(localStorage.getItem('avatarIndex') || '0');
    const seen2 = JSON.parse(localStorage.getItem('lastSeenMap') || '{}');
    setSavedIds(saved);
    setAvatarIndex(av);
    setLastSeenMap(seen2);
    const cached = localStorage.getItem('cachedRooms');
    if (cached) {
      try { setRooms(JSON.parse(cached)); setRoomsLoaded(true); } catch { }
    }

    // ── Intro: show only on very first visit ever ──
    const hasSeen = localStorage.getItem('hasSeenIntro');
    if (!hasSeen) {
      setShowIntro(true);
      localStorage.setItem('hasSeenIntro', '1');
    }
  }, []);

  const fetchRooms = useCallback(async (attempt = 0): Promise<void> => {
    if (isFetchingRef.current && attempt === 0) return;
    isFetchingRef.current = true;
    setFetchError(false);
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${BASE_URL}/api/rooms`, { signal: controller.signal });
      clearTimeout(tid);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRooms(data); setRoomsLoaded(true); setFetchError(false);
      localStorage.setItem('cachedRooms', JSON.stringify(data));
    } catch {
      clearTimeout(tid);
      if (attempt < 4) retryTimeoutRef.current = setTimeout(() => fetchRooms(attempt + 1), (attempt + 1) * 2000);
      else { setFetchError(true); setRoomsLoaded(true); }
    } finally { isFetchingRef.current = false; }
  }, []);

  const fetchBestContent = useCallback(async () => {
    try {
      const [dr, pr] = await Promise.all([fetch(`${BASE_URL}/api/today/best-drop`), fetch(`${BASE_URL}/api/today/best-poll`)]);
      if (dr.ok) setBestDrop(await dr.json());
      if (pr.ok) setBestPoll(await pr.json());
    } catch { }
  }, []);

  useEffect(() => {
    fetchRooms();
    fetchBestContent();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    return () => { if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current); };
  }, [fetchRooms, fetchBestContent]);

  const handleCreateRoom = async () => {
    if (!newRoom.title.trim()) return alert('Title is required!');
    if (newRoom.isPrivate && !newRoom.adminCode.trim()) return alert('Admin code is required for private rooms!');
    const res = await fetch(`${BASE_URL}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRoom),
    });
    if (!res.ok) return alert('Could not create room. Title may be taken.');
    const created = await res.json();
    const cs = JSON.parse(localStorage.getItem('savedRooms') || '[]');
    if (!cs.includes(created._id)) {
      const upd = [...cs, created._id];
      setSavedIds(upd);
      localStorage.setItem('savedRooms', JSON.stringify(upd));
    }
    setNewRoom({ title: '', color: '#22c55e', isAdult: false, isPrivate: false, adminCode: '' });
    setShowAddModal(false);
    fetchRooms(); paginate(2);
  };

  // ── Save current tab index AND scroll position so the room page can
  //    write them back into sessionStorage on its back-navigation.
  //    The room page reads 'returnTab' and 'returnScrollY' and sets them
  //    before calling router.back(), so this page's restore effect picks
  //    them up on mount.
  const markRoomSeen = (roomId: string) => {
    // Persist scroll position and active tab for restore after back-navigation
    sessionStorage.setItem('returnScrollY', String(window.scrollY));
    sessionStorage.setItem('returnTab', String(currentIndex));

    const upd = { ...lastSeenMap, [roomId]: Date.now() };
    setLastSeenMap(upd);
    localStorage.setItem('lastSeenMap', JSON.stringify(upd));
  };

  const selectAvatar = (idx: number) => {
    setAvatarIndex(idx);
    localStorage.setItem('avatarIndex', idx.toString());
    setShowAvatarModal(false);
  };

  const toggleSave = async (id: string) => {
    const isSaved = savedIds.includes(id);
    const ns = isSaved ? savedIds.filter(i => i !== id) : [...savedIds, id];
    setSavedIds(ns);
    localStorage.setItem('savedRooms', JSON.stringify(ns));
    setRooms(prev => prev.map(r => r._id === id ? { ...r, savedCount: Math.max(0, (r.savedCount || 0) + (isSaved ? -1 : 1)) } : r));
    try {
      await fetch(`${BASE_URL}/api/rooms/${id}/save`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: isSaved ? 'decrement' : 'increment' }) });
      fetchRooms();
    } catch { setSavedIds(prev => isSaved ? [...prev, id] : prev.filter(i => i !== id)); }
  };

  const scrollToRooms = () => roomsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const filtered = applyFilters(
    rooms
      .filter(r => currentIndex === 2 ? savedIds.includes(r._id) : true)
      .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase())),
    activeFilters
  ).sort((a, b) => currentIndex === 2 ? new Date(b.lastDropAt).getTime() - new Date(a.lastDropAt).getTime() : 0);

  if (!mounted) {
    return (
      <main className="w-full max-w-md mx-auto min-h-screen bg-black text-white flex items-center justify-center">
        <div suppressHydrationWarning className="text-white/20 text-xs font-black uppercase tracking-widest animate-pulse">Loading...</div>
      </main>
    );
  }

  return (
    <>
      {/* Intro overlay — only renders on first ever visit */}
      {showIntro && <IntroScreen onFinish={() => setShowIntro(false)} />}

      <main
        suppressHydrationWarning
        className="w-full max-w-md mx-auto min-h-screen pb-28 relative select-none overflow-x-hidden bg-black text-white"
      >
        {/* ── HEADER ── */}
        <header className="pt-10 px-4 flex items-center justify-center">
          <h1 className="text-3xl font-black tracking-tighter text-center">
            B<span className="mirror">L</span>ACK BOX
          </h1>
        </header>

        {/* ── 2-TAB CAPSULE ── */}
        <div className="flex justify-center mt-5 px-4 z-50 relative">
          <div
            className="relative flex items-center bg-[#111] border border-white/10 rounded-full p-1 w-full max-w-[240px]"
            style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)' }}
          >
            <motion.div
              className="absolute top-1 bottom-1 rounded-full bg-white/10"
              animate={{ left: currentIndex === 1 ? 4 : 'calc(50% + 0px)', width: 'calc(50% - 4px)' }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            />
            <button
              onClick={() => paginate(1)}
              className={`relative z-10 flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-full transition-colors duration-200 ${currentIndex === 1 ? 'text-[#fac9f6]' : 'text-white/40'}`}
            >
              Browse
            </button>
            <button
              onClick={() => paginate(2)}
              className={`relative z-10 flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-full transition-colors duration-200 ${currentIndex === 2 ? 'text-[#fac9f6]' : 'text-white/40'}`}
            >
              Saved
            </button>
          </div>
        </div>

        {/* ── SLIDE PAGES ── */}
        <div
          className="relative mt-4 touch-pan-y w-full overflow-hidden"
          onPointerDown={(e) => { dragStartXRef.current = e.clientX; }}
          onPointerUp={(e) => {
            const diff = e.clientX - dragStartXRef.current;
            if (Math.abs(diff) < 40) return;
            if (diff < 0 && currentIndex < 2) paginate(currentIndex + 1);
            else if (diff > 0 && currentIndex > 0) paginate(currentIndex - 1);
          }}
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full"
            >

              {/* ── INTRO PAGE (index 0) ── */}
              {currentIndex === 0 && (
                <div className="px-4 pt-6 pb-10 overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="rounded-[2rem] p-6 border border-white/10 relative overflow-hidden mb-2"
                    style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #111 100%)' }}
                  >
                    <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(250,201,246,0.15), transparent 60%)' }} />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <LiveDot color="#fac9f6" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Anonymous Platform</span>
                      </div>
                      <h2 className="text-2xl font-black uppercase italic tracking-tight text-white mb-2 leading-tight">
                        The Anonymous<br />Gossip Platform
                      </h2>
                      <p className="text-[11px] text-white/50 leading-relaxed">
                        Built for college &amp; school students to chat, rant, and gossip freely — no accounts, no identity, no judgment.
                      </p>
                    </div>
                  </motion.div>
                  <SectionLabel text="How It Works" />
                  <div className="flex flex-col gap-4">
                    <PosterCreateRoom onCreateRoom={() => { setShowAddModal(true); paginate(2); }} />
                    <PosterNewDrop />
                    <PosterModeration />
                    <PosterPolls />
                  </div>
                  <SectionLabel text="New Features" />
                  <div className="flex flex-col gap-4 pb-8">
                    <PosterAdultRoom />
                    <PosterPrivateRoom />
                  </div>
                </div>
              )}

              {/* ── BROWSE PAGE (index 1) ── */}
              {currentIndex === 1 && (
                <div className="mt-5">
                  <div className="px-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 h-11">
                      <button
                        onClick={scrollToRooms}
                        className="flex items-center gap-1.5 border border-white/10 bg-white/5 active:bg-white/10 px-3 h-full rounded-2xl text-[10px] font-black uppercase shrink-0 transition-all"
                      >
                        <Flame size={11} className="text-[#fac9f6]" fill="#fac9f6" />
                        {!searchOpen && <span className="text-white/70">Trending</span>}
                      </button>
                      <div className={`flex items-center h-full flex-1 bg-white/5 rounded-2xl border border-white/10 transition-all duration-300 ${searchOpen ? 'ring-1 ring-[#fac9f6]/30 bg-white/10' : ''}`}>
                        <button onClick={() => setSearchOpen(p => !p)} className="w-11 h-full flex items-center justify-center shrink-0">
                          <Search size={16} className={searchOpen ? 'text-[#fac9f6]' : 'text-white/40'} />
                        </button>
                        <AnimatePresence>
                          {searchOpen && (
                            <motion.input
                              initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                              autoFocus
                              className="flex-1 pr-3 outline-none text-sm bg-transparent text-white placeholder:text-white/20 font-medium min-w-0"
                              placeholder="Find a vibe..."
                              onChange={e => setSearchQuery(e.target.value)}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <FilterChipRow activeFilters={activeFilters} onToggle={toggleFilter} />
                  </div>

                  <div className="px-4 mt-4">
                    <AnimatedBlurb onReadMore={() => paginate(0)} />
                  </div>

                  {bestDrop?.drop && (
                    <div className="px-4 mt-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">Today&apos;s Best Drop</span>
                        <div className="h-px flex-1 bg-white/10" />
                      </div>
                      {bestDrop.room && (
                        <Link
                          href={`/room/${bestDrop.room.slug}`}
                          className="flex items-center gap-2 mb-2 px-1"
                          onClick={() => {
                            sessionStorage.setItem('returnScrollY', String(window.scrollY));
                            sessionStorage.setItem('returnTab', String(currentIndex));
                          }}
                        >
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: bestDrop.room.color }} />
                          <span className="text-[10px] font-black uppercase text-white/35 tracking-widest truncate">{bestDrop.room.title}</span>
                          <ChevronRight size={9} className="text-white/20 flex-shrink-0" />
                        </Link>
                      )}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                        className="rounded-2xl border border-white/10 p-4 relative overflow-hidden"
                        style={{ background: `linear-gradient(135deg, ${bestDrop.room?.color || '#fac9f6'}10 0%, #0a0a0a 100%)`, borderLeft: `3px solid ${bestDrop.room?.color || '#fac9f6'}40` }}
                      >
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                          <span className="text-[8px]">🏆</span>
                          <span className="text-[8px] font-black uppercase text-white/40">Top Drop</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <img src={`/avatars/${bestDrop.drop.avatarIndex ?? 0}.png`} className="w-8 h-8 rounded-full border border-white/20 flex-shrink-0" alt="" />
                          <div className="min-w-0">
                            <p className="text-[11px] font-black uppercase text-white/70 truncate">{bestDrop.drop.tempName || 'Anonymous'}</p>
                            <p className="text-[8px] text-white/25 font-bold uppercase">{formatTime(bestDrop.drop.createdAt)}</p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-white/80 leading-relaxed mb-3 line-clamp-4">{bestDrop.drop.content}</p>
                        <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                          <span className="flex items-center gap-1 text-[11px] font-black text-white/50"><Heart size={10} fill="currentColor" /> {bestDrop.drop.likes?.length || 0}</span>
                          <span className="flex items-center gap-1 text-[11px] font-black text-white/35"><ThumbsDown size={10} /> {bestDrop.drop.dislikes?.length || 0}</span>
                          {(bestDrop.drop.replies?.length || 0) > 0 && <span className="text-[9px] text-white/25 font-bold">{bestDrop.drop.replies.length} subdrops</span>}
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {bestPoll?.poll && (
                    <div className="px-4 mt-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">Today&apos;s Top Poll</span>
                        <div className="h-px flex-1 bg-white/10" />
                      </div>
                      {bestPoll.room && (
                        <Link
                          href={`/room/${bestPoll.room.slug}`}
                          className="flex items-center gap-2 mb-2 px-1"
                          onClick={() => {
                            sessionStorage.setItem('returnScrollY', String(window.scrollY));
                            sessionStorage.setItem('returnTab', String(currentIndex));
                          }}
                        >
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: bestPoll.room.color }} />
                          <span className="text-[10px] font-black uppercase text-white/35 tracking-widest truncate">{bestPoll.room.title}</span>
                          <ChevronRight size={9} className="text-white/20 flex-shrink-0" />
                        </Link>
                      )}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
                        className="rounded-2xl border border-white/10 p-4 relative"
                        style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.07) 0%, #0a0a0a 100%)', borderLeft: '3px solid rgba(167,139,250,0.35)' }}
                      >
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                          <BarChart2 size={8} className="text-[#a78bfa]" />
                          <span className="text-[8px] font-black uppercase text-white/40">Top Poll</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <img src={`/avatars/${bestPoll.poll.avatarIndex ?? 0}.png`} className="w-8 h-8 rounded-full border border-white/20 flex-shrink-0" alt="" />
                          <div className="min-w-0">
                            <p className="text-[11px] font-black uppercase text-white/70 truncate">{bestPoll.poll.tempName || 'Anonymous'}</p>
                            <p className="text-[8px] text-white/25 font-bold uppercase">{formatTime(bestPoll.poll.createdAt)}</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-white/85 mb-3">{bestPoll.poll.question}</p>
                        <div className="flex flex-col gap-1.5">
                          {bestPoll.poll.options?.map((opt: any, i: number) => {
                            const tv = bestPoll.poll.options.reduce((s: number, o: any) => s + o.voters.length, 0);
                            const pct = tv > 0 ? Math.round((opt.voters.length / tv) * 100) : 0;
                            return (
                              <div key={i} className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                                <div className="absolute inset-y-0 left-0 rounded-xl" style={{ width: `${pct}%`, background: 'rgba(167,139,250,0.2)', transition: 'width 1s ease' }} />
                                <div className="relative px-3 py-2 flex justify-between items-center">
                                  <span className="text-[11px] font-medium text-white/75 truncate pr-2">{opt.text}</span>
                                  <span className="text-[9px] font-black text-white/35 flex-shrink-0">{pct}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Users size={10} className="text-white/25" />
                          <span className="text-[9px] text-white/25 font-bold">{bestPoll.poll.options?.reduce((s: number, o: any) => s + o.voters.length, 0)} votes</span>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  <div ref={roomsRef} className="px-4 mt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">{filterLabel(activeFilters)}</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                    {fetchError && rooms.length === 0 && (
                      <div className="flex flex-col items-center gap-3 py-10">
                        <p className="text-white/30 text-xs font-black uppercase tracking-widest">Connection issue</p>
                        <button onClick={() => fetchRooms(0)} className="text-[#fac9f6] text-xs font-black uppercase border border-[#fac9f6]/30 px-4 py-2 rounded-full">Tap to retry</button>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pb-24">
                      {!roomsLoaded && !fetchError && [...Array(6)].map((_, i) => (
                        <div key={i} suppressHydrationWarning className="aspect-square rounded-[2rem] bg-white/5 border border-white/10 animate-pulse" />
                      ))}
                      {roomsLoaded && filtered.map((room: any) => (
                        <RoomTile key={room._id} room={room} isSaved={savedIds.includes(room._id)} onSave={() => toggleSave(room._id)} onOpen={() => markRoomSeen(room._id)} />
                      ))}
                      {roomsLoaded && filtered.length === 0 && !fetchError && (
                        <div className="col-span-2 flex flex-col items-center gap-2 py-10">
                          <p className="text-white/20 text-xs font-black uppercase tracking-widest">No rooms found</p>
                          {activeFilters.size > 0 && (
                            <button onClick={() => setActiveFilters(new Set())} className="text-[#fac9f6] text-xs font-black uppercase mt-1">Clear filters →</button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── SAVED PAGE (index 2) ── */}
              {currentIndex === 2 && (
                <div className="px-4 mt-7 flex flex-col items-center gap-5">
                  <div className="flex flex-col items-center">
                    <div
                      onClick={() => setShowAvatarModal(true)}
                      className="w-20 h-20 rounded-full border-4 border-[#fac9f6] p-1 cursor-pointer active:scale-95 transition-transform"
                      style={{ boxShadow: '0 0 18px rgba(250,201,246,0.25)' }}
                    >
                      <img src={`/avatars/${avatarIndex}.png`} className="w-full h-full rounded-full object-cover" alt="Avatar" />
                    </div>
                    <button onClick={() => setShowAvatarModal(true)} className="mt-1.5 text-[9px] font-black uppercase text-white/30 tracking-widest">Edit Bitmoji</button>
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    <div className={`flex items-center w-full h-11 bg-white/5 rounded-2xl border border-white/10 transition-all duration-300 ${searchOpen ? 'ring-1 ring-[#fac9f6]/30 bg-white/10' : ''}`}>
                      <button onClick={() => setSearchOpen(p => !p)} className="w-11 h-full flex items-center justify-center shrink-0">
                        <Search size={16} className={searchOpen ? 'text-[#fac9f6]' : 'text-white/40'} />
                      </button>
                      <AnimatePresence>
                        {searchOpen && (
                          <motion.input
                            initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                            autoFocus
                            className="flex-1 pr-4 outline-none text-sm bg-transparent text-white placeholder:text-white/20 font-medium min-w-0"
                            placeholder="Search saved rooms..."
                            onChange={e => setSearchQuery(e.target.value)}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                    <FilterChipRow activeFilters={activeFilters} onToggle={toggleFilter} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full pb-24">
                    {fetchError && rooms.length === 0 && (
                      <div className="col-span-2 flex flex-col items-center gap-3 py-10">
                        <p className="text-white/30 text-xs font-black uppercase tracking-widest">Connection issue</p>
                        <button onClick={() => fetchRooms(0)} className="text-[#fac9f6] text-xs font-black uppercase border border-[#fac9f6]/30 px-4 py-2 rounded-full">Tap to retry</button>
                      </div>
                    )}
                    {!roomsLoaded && !fetchError && [...Array(4)].map((_, i) => (
                      <div key={i} suppressHydrationWarning className="aspect-square rounded-[2rem] bg-white/5 border border-white/10 animate-pulse" />
                    ))}
                    {roomsLoaded && filtered.map((room: any) => {
                      const lastSeen = lastSeenMap[room._id] || 0;
                      const hasNew = new Date(room.lastDropAt).getTime() > lastSeen;
                      return (
                        <div key={room._id} className="relative">
                          {hasNew && <div className="dot-badge">!</div>}
                          <RoomTile room={room} isSaved={true} onSave={() => toggleSave(room._id)} onOpen={() => markRoomSeen(room._id)} />
                        </div>
                      );
                    })}
                    {roomsLoaded && filtered.length === 0 && !fetchError && (
                      <div className="col-span-2 flex flex-col items-center gap-2 py-10">
                        <p className="text-white/20 text-xs font-black uppercase tracking-widest">
                          {savedIds.length === 0 ? 'No saved rooms yet' : 'No rooms match this filter'}
                        </p>
                        {activeFilters.size > 0 ? (
                          <button onClick={() => setActiveFilters(new Set())} className="text-[#fac9f6] text-xs font-black uppercase mt-1">Clear filters →</button>
                        ) : (
                          <button onClick={() => paginate(1)} className="text-[#fac9f6] text-xs font-black uppercase mt-1">Browse rooms →</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── FAB: Create Room (Saved tab) ── */}
        <AnimatePresence>
          {currentIndex === 2 && (
            <motion.button
              key="fab"
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              onClick={() => setShowAddModal(true)}
              className="fixed bottom-7 right-5 w-14 h-14 bg-[#fac9f6] text-black rounded-full flex items-center justify-center shadow-2xl z-[60] active:scale-90 transition-transform"
            >
              <Plus size={28} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── CREATE ROOM MODAL ── */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-end justify-center p-0"
              onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
            >
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-[#0a0a0a] w-full max-w-md rounded-t-[2rem] px-5 pt-5 pb-10 border-t border-x border-white/10 relative shadow-2xl overflow-y-auto max-h-[90vh]"
              >
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
                <button onClick={() => setShowAddModal(false)} className="absolute top-5 right-5 text-white/40 p-1"><X size={20} /></button>
                <h2 className="text-xl font-black italic uppercase mb-5">Create Room</h2>

                <label className="text-[10px] font-black uppercase text-white/40 mb-1.5 block">Room Title</label>
                <input
                  className="w-full border border-white/10 bg-black p-3.5 rounded-2xl mb-5 outline-none font-bold text-white placeholder:text-white/30 text-sm"
                  placeholder="E.g. Library Gossips"
                  value={newRoom.title}
                  onChange={e => setNewRoom({ ...newRoom, title: e.target.value })}
                />

                <label className="text-[10px] font-black uppercase text-white/40 mb-1.5 block">Theme Color</label>
                <input
                  type="color"
                  className="w-full h-11 rounded-xl mb-5 cursor-pointer"
                  value={newRoom.color}
                  onChange={e => setNewRoom({ ...newRoom, color: e.target.value })}
                />

                <label className="text-[10px] font-black uppercase text-white/40 mb-2 block">Room Type</label>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {[
                    { key: false, icon: '🛡️', label: 'Safe Room', sub: 'Language filtered' },
                    { key: true, icon: '🔞', label: 'Adult Room', sub: '18+ only, unfiltered' },
                  ].map((opt) => (
                    <button
                      key={String(opt.key)}
                      onClick={() => setNewRoom(r => ({ ...r, isAdult: opt.key }))}
                      className="flex flex-col items-start gap-1 p-3 rounded-2xl border transition-all"
                      style={{
                        borderColor: newRoom.isAdult === opt.key ? (opt.key ? '#ef4444' : '#4ade80') + '80' : 'rgba(255,255,255,0.1)',
                        background: newRoom.isAdult === opt.key ? (opt.key ? 'rgba(239,68,68,0.08)' : 'rgba(74,222,128,0.06)') : 'rgba(255,255,255,0.03)',
                      }}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <span className="text-[11px] font-black text-white/80">{opt.label}</span>
                      <span className="text-[9px] text-white/35">{opt.sub}</span>
                    </button>
                  ))}
                </div>
                {newRoom.isAdult && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-5 p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex items-start gap-2">
                    <ShieldAlert size={14} className="text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-yellow-300/60 leading-relaxed">Adult language allowed. CSAM and terrorism-related content are always blocked.</p>
                  </motion.div>
                )}

                <label className="text-[10px] font-black uppercase text-white/40 mb-2 block">Visibility</label>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {[
                    { key: false, icon: '🌐', label: 'Public', sub: 'Anyone can join' },
                    { key: true, icon: '🔒', label: 'Private', sub: 'Invite only' },
                  ].map((opt) => (
                    <button
                      key={String(opt.key)}
                      onClick={() => setNewRoom(r => ({ ...r, isPrivate: opt.key, adminCode: '' }))}
                      className="flex flex-col items-start gap-1 p-3 rounded-2xl border transition-all"
                      style={{
                        borderColor: newRoom.isPrivate === opt.key ? '#60a5fa80' : 'rgba(255,255,255,0.1)',
                        background: newRoom.isPrivate === opt.key ? 'rgba(96,165,250,0.07)' : 'rgba(255,255,255,0.03)',
                      }}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <span className="text-[11px] font-black text-white/80">{opt.label}</span>
                      <span className="text-[9px] text-white/35">{opt.sub}</span>
                    </button>
                  ))}
                </div>

                {newRoom.isPrivate && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
                    <label className="text-[10px] font-black uppercase text-[#60a5fa]/70 mb-1.5 flex items-center gap-1.5 block">
                      <Lock size={10} /> Admin Code <span className="text-white/30">(keep this secret)</span>
                    </label>
                    <input
                      className="w-full border border-[#60a5fa]/30 bg-black p-3.5 rounded-2xl outline-none font-bold text-white placeholder:text-white/20 text-sm tracking-[0.2em]"
                      placeholder="E.g. blackbox123"
                      value={newRoom.adminCode}
                      onChange={e => setNewRoom({ ...newRoom, adminCode: e.target.value })}
                    />
                    <p className="text-[9px] text-white/25 mt-1.5">Enter this code on the room page to manage join requests.</p>
                  </motion.div>
                )}

                <p className="text-red-500 text-[10px] font-black uppercase mb-1">Don&apos;t forget to copy the link</p>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-3 rounded-xl mb-5">
                  <span className="text-[10px] text-white/50 font-mono truncate flex-1">
                    blackbox-omega-peach.vercel.app/room/{newRoom.title.toLowerCase().replace(/ /g, '-')}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`blackbox-omega-peach.vercel.app/room/${newRoom.title.toLowerCase().replace(/ /g, '-')}`);
                      setCopiedCreate(true); setTimeout(() => setCopiedCreate(false), 2000);
                    }}
                    className="shrink-0 p-1"
                  >
                    {copiedCreate ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-white/40" />}
                  </button>
                </div>

                <button
                  onClick={handleCreateRoom}
                  className="w-full bg-white text-black py-3.5 rounded-2xl font-black uppercase tracking-widest text-sm active:scale-95 transition-all"
                >
                  Create
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── AVATAR MODAL ── */}
        <AnimatePresence>
          {showAvatarModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-end justify-center p-0"
              onClick={(e) => { if (e.target === e.currentTarget) setShowAvatarModal(false); }}
            >
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full max-w-md rounded-t-[2rem] px-5 pt-5 pb-10 border-t border-x border-white/10 max-h-[75vh] overflow-y-auto bg-[#0a0a0a]"
              >
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-black uppercase italic">Pick Your Bitmoji</h2>
                  <button onClick={() => setShowAvatarModal(false)} className="text-white/40 p-1"><X size={20} /></button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(19)].map((_, i) => (
                    <div
                      key={i}
                      onClick={() => selectAvatar(i)}
                      className={`aspect-square rounded-full border-2 p-1 cursor-pointer transition-all active:scale-90 ${avatarIndex === i ? 'border-[#fac9f6] scale-110' : 'border-white/10'}`}
                    >
                      <img src={`/avatars/${i}.png`} className="w-full h-full rounded-full object-cover" alt="" />
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}

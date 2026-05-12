"use client";

import { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import {
  Search, Flame, Plus, X, Copy, Heart, ThumbsDown,
  BarChart2, Users, ChevronRight, Check,
  RotateCcw, Trophy, Zap, ShieldCheck,
} from 'lucide-react';
import { FaInstagram, FaLinkedin } from 'react-icons/fa';
import RoomTile from '@/components/RoomTile';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function formatTime(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ── SPLASH SCREEN ── */
function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-4xl font-black tracking-tighter text-white"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        B<span className="mirror">L</span>ACK BOX
      </motion.h1>
    </motion.div>
  );
}

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
                {step >= 1
                  ? <>E.g. Library Gossips{step < 2 ? <Cursor /> : null}</>
                  : <span className="text-white/20">E.g. Library Gossips</span>}
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
            <motion.span className="inline-block rounded-full shrink-0" style={{ width: 6, height: 6, background: '#ef4444' }} animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.4, repeat: Infinity }} />
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

function DevProfile() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(250,201,246,0.08)]"
      style={{ background: '#0a0a0a' }}
    >
      <div className="flex flex-col items-center text-center p-8">
        <div className="relative w-28 h-28 mb-5">
          <div className="absolute inset-0 bg-[#fac9f6] rounded-[2.5rem] blur-2xl opacity-20 animate-pulse" />
          <img src="/me.jpeg" alt="Daksh Vasani" className="w-full h-full object-cover rounded-[2.5rem] border-2 border-[#fac9f6] relative z-10" />
        </div>
        <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white mb-1">Daksh Vasani</h2>
        <p className="text-[10px] font-bold text-[#fac9f6] uppercase tracking-[0.3em] mb-6">Founder & Architect</p>
        <div className="space-y-3 w-full mb-6">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-3 text-left">
            <ShieldCheck className="text-[#fac9f6] shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-[11px] font-black uppercase text-white/90">Anonymous & Safe</p>
              <p className="text-[9px] text-white/40 mt-1 leading-relaxed">Built to let students voice out without fear. AI filters block toxicity in real-time.</p>
            </div>
          </div>
          <div className="relative w-full h-36 rounded-3xl overflow-hidden border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-[#fac9f6]/20 via-[#eab4ff]/20 to-[#f3d1ff]/20 blur-2xl animate-pulse" />
            <img src="/censor.png" alt="" className="w-full h-full object-cover relative z-10" />
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-20" />
            <div className="absolute bottom-3 left-4 z-30">
              <p className="text-[10px] font-black uppercase text-white/80 tracking-widest">AI MODERATION ACTIVE</p>
              <p className="text-[8px] text-white/40">Real-time censorship engine</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full">
          <a href="https://www.linkedin.com/in/daksh-vasani/" target="_blank" rel="noreferrer"
            className="flex-1 flex items-center justify-center p-4 bg-[#0077b5]/10 border border-[#0077b5]/20 rounded-2xl text-[#0077b5]">
            <FaLinkedin size={18} />
          </a>
          <a href="https://www.instagram.com/wasitreallydaksh" target="_blank" rel="noreferrer"
            className="flex-1 flex items-center justify-center p-4 bg-pink-500/10 border border-pink-500/20 rounded-2xl text-pink-500">
            <FaInstagram size={18} />
          </a>
        </div>
        <p className="mt-6 text-[8px] font-black text-white/20 uppercase tracking-widest">© 2026 Black Box Protocol</p>
      </div>
    </motion.div>
  );
}

/* ── GAME ── */
const GW = 390, GH = 520, GROUND_Y = 400, CUBE_SIZE = 36;
const GRAVITY = 0.55, JUMP_FORCE = -13.5, DOUBLE_JUMP_FORCE = -12, BASE_SPEED = 5;

type ObstacleType = 'low' | 'tall' | 'floating' | 'double';
interface Obstacle { x: number; w: number; h: number; y: number; type: ObstacleType; color: string; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; r: number; }

const LEVEL_CONFIG = Array.from({ length: 50 }, (_, i) => {
  const lvl = i + 1;
  return {
    speed: BASE_SPEED + lvl * 0.28,
    gap: Math.max(280, 520 - lvl * 4),
    obstacleTypes: lvl < 5 ? ['low'] as ObstacleType[] : lvl < 12 ? ['low', 'tall'] as ObstacleType[] : lvl < 22 ? ['low', 'tall', 'floating'] as ObstacleType[] : ['low', 'tall', 'floating', 'double'] as ObstacleType[],
    accentColor: ['#fac9f6', '#a78bfa', '#34d399', '#60a5fa', '#f87171', '#fbbf24', '#c084fc', '#2dd4bf', '#f472b6', '#818cf8'][Math.floor(lvl / 5) % 10],
  };
});

function getObstacle(lvl: number, startX: number): Obstacle {
  const cfg = LEVEL_CONFIG[Math.min(lvl - 1, 49)];
  const type = cfg.obstacleTypes[Math.floor(Math.random() * cfg.obstacleTypes.length)];
  const col = cfg.accentColor;
  switch (type) {
    case 'low': return { x: startX, w: 24, h: 32, y: GROUND_Y - 32, type, color: col };
    case 'tall': return { x: startX, w: 22, h: 58, y: GROUND_Y - 58, type, color: col };
    case 'floating': return { x: startX, w: 32, h: 18, y: GROUND_Y - 90 - Math.random() * 40, type, color: col };
    case 'double': return { x: startX, w: 20, h: 44, y: GROUND_Y - 44, type, color: col };
    default: return { x: startX, w: 24, h: 32, y: GROUND_Y - 32, type, color: col };
  }
}

function drawCube(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number, accent: string, jumping: boolean) {
  const s = size, d = s * 0.3;
  ctx.save();
  ctx.translate(x + s / 2, y + s / 2);
  ctx.rotate(jumping ? rot * 0.08 : rot * 0.03);
  ctx.fillStyle = '#1a1a1a'; ctx.strokeStyle = accent; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.rect(-s / 2, -s / 2, s, s); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-s / 2, -s / 2); ctx.lineTo(-s / 2 + d, -s / 2 - d); ctx.lineTo(s / 2 + d, -s / 2 - d); ctx.lineTo(s / 2, -s / 2); ctx.closePath();
  ctx.fillStyle = '#2a2a2a'; ctx.fill(); ctx.strokeStyle = accent + '88'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(s / 2, -s / 2); ctx.lineTo(s / 2 + d, -s / 2 - d); ctx.lineTo(s / 2 + d, s / 2 - d); ctx.lineTo(s / 2, s / 2); ctx.closePath();
  ctx.fillStyle = '#131313'; ctx.fill(); ctx.strokeStyle = accent + '66'; ctx.stroke();
  ctx.beginPath(); ctx.rect(-s / 2 + 3, -s / 2 + 3, s - 6, s - 6); ctx.strokeStyle = accent + '44'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
}

function GameView({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const gameRef = useRef({
    running: false, over: false, started: false,
    cubeY: GROUND_Y - CUBE_SIZE, cubeVY: 0,
    jumping: false, doubleAvail: true,
    obstacles: [] as Obstacle[], particles: [] as Particle[],
    score: 0, dist: 0, level: 1, nextLevelDist: 500,
    spawnCooldown: 180, cubeRot: 0, bgOffset: 0,
    stars: [] as { x: number; y: number; r: number; op: number }[],
    scrollLines: [] as { x: number; speed: number; op: number }[],
  });

  const [uiState, setUiState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef(1);

  useEffect(() => {
    const hs = parseInt(localStorage.getItem('bbgame-hs') || '0');
    setHighScore(hs);
    const g = gameRef.current;
    g.stars = Array.from({ length: 60 }, () => ({ x: Math.random() * GW, y: Math.random() * (GROUND_Y - 60), r: Math.random() * 1.5 + 0.5, op: Math.random() * 0.6 + 0.2 }));
    g.scrollLines = Array.from({ length: 8 }, () => ({ x: Math.random() * GW, speed: Math.random() * 2 + 1, op: Math.random() * 0.12 + 0.04 }));
  }, []);

  const spawnJumpParticles = () => {
    const g = gameRef.current;
    const acc = LEVEL_CONFIG[Math.min(g.level - 1, 49)].accentColor;
    for (let i = 0; i < 8; i++) {
      g.particles.push({ x: 36 + CUBE_SIZE / 2, y: g.cubeY + CUBE_SIZE, vx: (Math.random() - 0.5) * 3, vy: Math.random() * 2 + 1, life: 1, maxLife: 1, color: acc, r: Math.random() * 3 + 1 });
    }
  };

  const jump = useCallback(() => {
    const g = gameRef.current;
    if (!g.started) { g.started = true; g.running = true; setUiState('playing'); }
    if (g.over) return;
    if (!g.jumping) { g.cubeVY = JUMP_FORCE; g.jumping = true; g.doubleAvail = true; spawnJumpParticles(); }
    else if (g.doubleAvail) { g.cubeVY = DOUBLE_JUMP_FORCE; g.doubleAvail = false; spawnJumpParticles(); }
  }, []);

  const resetGame = useCallback(() => {
    const g = gameRef.current;
    g.running = false; g.over = false; g.started = false;
    g.cubeY = GROUND_Y - CUBE_SIZE; g.cubeVY = 0;
    g.jumping = false; g.doubleAvail = true;
    g.obstacles = []; g.particles = [];
    g.score = 0; g.dist = 0; g.level = 1; g.nextLevelDist = 500;
    g.spawnCooldown = 180; g.cubeRot = 0; g.bgOffset = 0;
    prevLevelRef.current = 1;
    setScore(0); setLevel(1); setUiState('idle');
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const loop = () => {
      const g = gameRef.current;
      const cfg = LEVEL_CONFIG[Math.min(g.level - 1, 49)];
      const spd = cfg.speed, acc = cfg.accentColor;
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, GW, GH);
      g.stars.forEach(s => { s.x -= 0.3; if (s.x < 0) { s.x = GW; s.y = Math.random() * (GROUND_Y - 60); } ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,255,255,${s.op})`; ctx.fill(); });
      g.scrollLines.forEach(l => { if (!g.running) return; l.x -= l.speed * (spd / BASE_SPEED); if (l.x < 0) l.x = GW + 20; ctx.strokeStyle = `rgba(255,255,255,${l.op})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(l.x, 0); ctx.lineTo(l.x - 60, GROUND_Y); ctx.stroke(); });
      ctx.fillStyle = '#111'; ctx.fillRect(0, GROUND_Y, GW, GH - GROUND_Y);
      ctx.shadowColor = acc; ctx.shadowBlur = 6; ctx.strokeStyle = acc + '60'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(GW, GROUND_Y); ctx.stroke(); ctx.shadowBlur = 0;
      const gx = ((g.bgOffset * 0.5) % 60); ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 0.5;
      for (let i = -60; i < GW + 60; i += 60) { ctx.beginPath(); ctx.moveTo(i - gx, GROUND_Y); ctx.lineTo(i - gx, GH); ctx.stroke(); }
      if (g.running && !g.over) {
        g.bgOffset += spd;
        g.cubeVY += GRAVITY; g.cubeY += g.cubeVY;
        if (g.cubeY >= GROUND_Y - CUBE_SIZE) { g.cubeY = GROUND_Y - CUBE_SIZE; g.cubeVY = 0; g.jumping = false; g.doubleAvail = true; }
        g.cubeRot += 2;
        g.spawnCooldown--;
        if (g.spawnCooldown <= 0 && g.obstacles.length < 4) {
          g.obstacles.push(getObstacle(g.level, GW + 40));
          const last = g.obstacles[g.obstacles.length - 1];
          if (last.type === 'double') g.obstacles.push({ ...getObstacle(g.level, GW + 40 + last.w + 28), type: 'low', color: acc });
          g.spawnCooldown = cfg.gap / spd;
        }
        g.obstacles = g.obstacles.filter(o => o.x + o.w > -10);
        g.obstacles.forEach(o => { o.x -= spd; });
        g.dist += spd; g.score = Math.floor(g.dist / 10);
        if (g.dist > g.nextLevelDist && g.level < 50) {
          g.level++; g.nextLevelDist += 600 + g.level * 60;
          if (g.level !== prevLevelRef.current) { prevLevelRef.current = g.level; setLevel(g.level); setShowLevelUp(true); setTimeout(() => setShowLevelUp(false), 1500); }
        }
        setScore(g.score);
        g.particles = g.particles.filter(p => p.life > 0);
        g.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.05; });
        const cx = 36, cy = g.cubeY, cw = CUBE_SIZE, ch = CUBE_SIZE;
        for (const o of g.obstacles) {
          if (cx + cw - 4 > o.x + 3 && cx + 4 < o.x + o.w - 3 && cy + ch - 4 > o.y + 3 && cy + 4 < o.y + o.h - 3) {
            g.over = true; g.running = false;
            for (let i = 0; i < 20; i++) g.particles.push({ x: cx + cw / 2, y: cy + ch / 2, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 1, maxLife: 1, color: acc, r: Math.random() * 4 + 1 });
            const hs = parseInt(localStorage.getItem('bbgame-hs') || '0');
            if (g.score > hs) { localStorage.setItem('bbgame-hs', String(g.score)); setHighScore(g.score); }
            setUiState('over'); break;
          }
        }
      }
      g.obstacles.forEach(o => { ctx.shadowColor = o.color; ctx.shadowBlur = 8; ctx.fillStyle = '#111'; ctx.strokeStyle = o.color; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(o.x, o.y, o.w, o.h, 4); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0; ctx.strokeStyle = o.color + '44'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.roundRect(o.x + 3, o.y + 3, o.w - 6, o.h - 6, 2); ctx.stroke(); });
      ctx.shadowColor = acc; ctx.shadowBlur = 12;
      drawCube(ctx, 36, g.cubeY, CUBE_SIZE, g.cubeRot, acc, g.jumping);
      ctx.shadowBlur = 0;
      g.particles.forEach(p => { ctx.globalAlpha = p.life; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill(); });
      ctx.globalAlpha = 1;
      if (g.started) { ctx.font = 'bold 13px monospace'; ctx.fillStyle = acc; ctx.textAlign = 'right'; ctx.fillText(`LVL ${g.level}`, GW - 16, 28); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '11px monospace'; ctx.fillText(`${g.score}`, GW - 16, 46); }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump]);

  const handleTap = useCallback((e: React.TouchEvent | React.MouseEvent) => { e.preventDefault(); jump(); }, [jump]);
  const accentNow = LEVEL_CONFIG[Math.min(level - 1, 49)].accentColor;

  return (
    <div className="flex flex-col items-center pb-10">
      <div className="w-full flex items-center gap-3 px-4 mb-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-lg border border-white/20 bg-black flex items-center justify-center overflow-hidden">
            <Image src="/logo 2.png" alt="BB" width={20} height={20} className="object-contain" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase italic tracking-tight text-white leading-none">BlackBox Runner</h2>
            <p className="text-[8px] font-bold uppercase text-white/30 tracking-widest">Tap · Double-tap = double jump</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 border border-white/10 rounded-xl px-3 py-1.5 bg-white/5">
          <Trophy size={11} className="text-[#fbbf24]" />
          <span className="text-[10px] font-black text-white/70">{highScore}</span>
        </div>
      </div>
      <div className="relative" style={{ width: GW, height: GH }}>
        <canvas ref={canvasRef} width={GW} height={GH} style={{ display: 'block', touchAction: 'none', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }} onTouchStart={handleTap} onClick={handleTap} />
        <AnimatePresence>
          {uiState === 'idle' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center" style={{ borderRadius: '1.5rem', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
              <motion.div animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-20 h-20 rounded-[1.5rem] border-2 border-white/20 bg-[#111] flex items-center justify-center mb-6 overflow-hidden" style={{ boxShadow: '0 0 30px rgba(250,201,246,0.2)' }}>
                <Image src="/logo 2.png" alt="BB" width={52} height={52} className="object-contain" />
              </motion.div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white mb-1">BlackBox Runner</h2>
              <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest mb-8">50 levels · tap to start</p>
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.4, repeat: Infinity }} className="text-[13px] font-black uppercase tracking-[0.3em] text-white/60">TAP / SPACE to start</motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {uiState === 'over' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-0 flex flex-col items-center justify-center gap-4" style={{ borderRadius: '1.5rem', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
              <motion.div animate={{ rotate: [0, -5, 5, -3, 0] }} transition={{ duration: 0.5 }} className="text-4xl mb-2">💥</motion.div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Game Over</h2>
              <div className="grid grid-cols-3 gap-3 w-64">
                {[{ label: 'Score', val: score, icon: '⚡' }, { label: 'Level', val: level, icon: '🎯' }, { label: 'Best', val: highScore, icon: '🏆' }].map(({ label, val, icon }) => (
                  <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-2xl border border-white/10 bg-white/5">
                    <span className="text-lg">{icon}</span>
                    <span className="text-base font-black text-white">{val}</span>
                    <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">{label}</span>
                  </div>
                ))}
              </div>
              {score >= highScore && score > 0 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }} className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#fbbf24]/40 bg-[#fbbf24]/10">
                  <Trophy size={12} className="text-[#fbbf24]" />
                  <span className="text-[10px] font-black uppercase text-[#fbbf24] tracking-widest">New High Score!</span>
                </motion.div>
              )}
              <button onClick={resetGame} className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-sm active:scale-95 transition-all mt-2">
                <RotateCcw size={16} /> Play Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showLevelUp && (
            <motion.div initial={{ opacity: 0, y: -20, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.85 }} className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-black/80 backdrop-blur-sm" style={{ zIndex: 50 }}>
              <Zap size={12} className="text-[#fbbf24]" />
              <span className="text-[11px] font-black uppercase tracking-widest text-white">Level {level}!</span>
            </motion.div>
          )}
        </AnimatePresence>
        {uiState === 'playing' && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-4 py-2 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentNow }} />
              <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">Lvl {level}</span>
            </div>
            <span className="text-[11px] font-black text-white/70 font-mono">{score}</span>
            <div className="flex items-center gap-1.5">
              <Trophy size={10} className="text-[#fbbf24]/60" />
              <span className="text-[10px] font-black text-white/35 font-mono">{highScore}</span>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center gap-4 text-[9px] font-black uppercase text-white/20 tracking-widest flex-wrap justify-center px-4">
        <span>TAP = Jump</span><span>·</span><span>Double tap = Double jump</span><span>·</span><span>SPACE / ↑</span>
      </div>
      {uiState === 'playing' && (
        <div className="mt-3 w-full px-4">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ backgroundColor: accentNow }} animate={{ width: `${(level / 50) * 100}%` }} transition={{ duration: 0.5 }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] font-black uppercase text-white/20">Level {level}/50</span>
            <span className="text-[8px] font-black uppercase text-white/20">{Math.round((level / 50) * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
};

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [direction, setDirection] = useState(0);

  // Show splash on EVERY visit — start false to avoid SSR mismatch, set true in useEffect
  const [showSplash, setShowSplash] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  const [rooms, setRooms] = useState<any[]>([]);
  const [roomsLoaded, setRoomsLoaded] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [lastSeenMap, setLastSeenMap] = useState<any>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ title: '', color: '#22c55e' });
  const [fetchError, setFetchError] = useState(false);
  const [bestDrop, setBestDrop] = useState<any>(null);
  const [bestPoll, setBestPoll] = useState<any>(null);
  const [copiedCreate, setCopiedCreate] = useState(false);

  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFetchingRef = useRef(false);
  const roomsRef = useRef<HTMLDivElement>(null);

  const paginate = (newIndex: number) => {
    setDirection(newIndex > currentIndex ? 1 : -1);
    setCurrentIndex(newIndex);
  };

  useEffect(() => { setSearchOpen(false); setSearchQuery(''); }, [currentIndex]);

  useEffect(() => {
    // Always show splash on every fresh page load
    setShowSplash(true);

    // Mark session so AppGuard on room pages knows we came from within the app
    sessionStorage.setItem('hasSeenIntro', 'true');

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

  const handleSwipe = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const { offset, velocity } = info;
    const isSwipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 300;
    if (!isSwipe) return;
    if (offset.x < 0 && currentIndex < 3) paginate(currentIndex + 1);
    else if (offset.x > 0 && currentIndex > 0) paginate(currentIndex - 1);
  };

  const handleCreateRoom = async () => {
    if (!newRoom.title.trim()) return alert('Title is required!');
    const res = await fetch(`${BASE_URL}/api/rooms`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newRoom) });
    if (!res.ok) return alert('Could not create room. Title may be taken.');
    const created = await res.json();
    const cs = JSON.parse(localStorage.getItem('savedRooms') || '[]');
    if (!cs.includes(created._id)) {
      const upd = [...cs, created._id];
      setSavedIds(upd);
      localStorage.setItem('savedRooms', JSON.stringify(upd));
    }
    setNewRoom({ title: '', color: '#22c55e' }); setShowAddModal(false);
    fetchRooms(); paginate(2);
  };

  const markRoomSeen = (roomId: string) => {
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

  const filtered = rooms
    .filter(r => currentIndex === 2 ? savedIds.includes(r._id) : true)
    .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => currentIndex === 2 ? new Date(b.lastDropAt).getTime() - new Date(a.lastDropAt).getTime() : 0);

  return (
    <>
      {/* Splash on every visit — client only, starts false so SSR is clean */}
      <AnimatePresence onExitComplete={() => setSplashDone(true)}>
        {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      </AnimatePresence>

      <main
        suppressHydrationWarning
        className={`w-full max-w-md mx-auto min-h-screen pb-28 relative select-none overflow-x-hidden bg-black text-white transition-opacity duration-300 ${splashDone || !showSplash ? 'opacity-100' : 'opacity-0'}`}
      >
        <header className="pt-10 px-4 flex justify-center">
          <h1 className="text-3xl font-black tracking-tighter text-center">
            B<span className="mirror">L</span>ACK BOX
          </h1>
        </header>

        <div className="flex justify-center items-center gap-3 mt-5 px-4 z-50 relative">
          <button
            onClick={() => paginate(0)}
            className={`w-10 h-10 rounded-full border flex items-center justify-center overflow-hidden shrink-0 transition-all ${currentIndex === 0 ? 'border-[#fac9f6] scale-110' : 'border-white/10 opacity-50'}`}
            style={{ boxShadow: currentIndex === 0 ? '0 0 14px rgba(250,201,246,0.25)' : undefined }}
          >
            <Image src="/logo 2.png" alt="Intro" width={24} height={24} style={{ mixBlendMode: 'screen' }} />
          </button>
          <div className="relative flex items-center bg-[#111] border border-white/10 rounded-full p-1 flex-1 max-w-[220px]" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)' }}>
            <motion.div
              className="absolute top-1 bottom-1 rounded-full bg-white/10"
              animate={{ left: currentIndex === 1 ? 4 : 'calc(50% + 0px)', width: 'calc(50% - 4px)', opacity: currentIndex === 1 || currentIndex === 2 ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            />
            <button onClick={() => paginate(1)} className={`relative z-10 flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-full transition-colors duration-200 ${currentIndex === 1 ? 'text-[#fac9f6]' : 'text-white/40'}`}>Browse</button>
            <button onClick={() => paginate(2)} className={`relative z-10 flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-full transition-colors duration-200 ${currentIndex === 2 ? 'text-[#fac9f6]' : 'text-white/40'}`}>Saved</button>
          </div>
          <button
            onClick={() => paginate(3)}
            className={`w-10 h-10 rounded-full border flex items-center justify-center overflow-hidden shrink-0 transition-all ${currentIndex === 3 ? 'border-[#fac9f6] scale-110' : 'border-white/10 opacity-50'}`}
          >
            <Image src="/logo 3.png" alt="Game" width={22} height={22} style={{ mixBlendMode: 'screen' }} />
          </button>
        </div>

        <motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.1} onDragEnd={handleSwipe} className="relative mt-4 touch-pan-y w-full">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full"
            >
              {currentIndex === 0 && (
                <div className="px-4 pt-6 pb-10 overflow-y-auto">
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="rounded-[2rem] p-6 border border-white/10 relative overflow-hidden mb-2" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #111 100%)' }}>
                    <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(250,201,246,0.15), transparent 60%)' }} />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <LiveDot color="#fac9f6" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Anonymous Platform</span>
                      </div>
                      <h2 className="text-2xl font-black uppercase italic tracking-tight text-white mb-2 leading-tight">The Anonymous<br />Gossip Platform</h2>
                      <p className="text-[11px] text-white/50 leading-relaxed">Built for college & school students to chat, rant, and gossip freely — no accounts, no identity, no judgment.</p>
                    </div>
                  </motion.div>
                  <SectionLabel text="How It Works" />
                  <div className="flex flex-col gap-4">
                    <PosterCreateRoom onCreateRoom={() => { setShowAddModal(true); paginate(2); }} />
                    <PosterNewDrop />
                    <PosterModeration />
                    <PosterPolls />
                  </div>
                  <SectionLabel text="The Builder" />
                  <DevProfile />
                </div>
              )}

              {currentIndex === 1 && (
                <div className="mt-5">
                  <div className="px-4 flex items-center gap-2 h-11">
                    <button onClick={scrollToRooms} className="flex items-center gap-1.5 border border-white/10 bg-white/5 active:bg-white/10 px-3 h-full rounded-2xl text-[10px] font-black uppercase shrink-0 transition-all">
                      <Flame size={11} className="text-[#fac9f6]" fill="#fac9f6" />
                      {!searchOpen && <span>Trending</span>}
                    </button>
                    <div className={`flex items-center h-full flex-1 bg-white/5 rounded-2xl border border-white/10 transition-all duration-300 ${searchOpen ? 'ring-1 ring-[#fac9f6]/30 bg-white/10' : ''}`}>
                      <button onClick={() => setSearchOpen(p => !p)} className="w-11 h-full flex items-center justify-center shrink-0">
                        <Search size={16} className={searchOpen ? 'text-[#fac9f6]' : 'text-white/40'} />
                      </button>
                      <AnimatePresence>
                        {searchOpen && (
                          <motion.input initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                            autoFocus className="flex-1 pr-3 outline-none text-sm bg-transparent text-white placeholder:text-white/20 font-medium min-w-0"
                            placeholder="Find a vibe..." onChange={e => setSearchQuery(e.target.value)} />
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="px-4 mt-4">
                    <AnimatedBlurb onReadMore={() => paginate(0)} />
                  </div>
                  {bestDrop?.drop && (
                    <div className="px-4 mt-5">
                      <div className="flex items-center gap-2 mb-3"><div className="h-px flex-1 bg-white/10" /><span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">Today&apos;s Best Drop</span><div className="h-px flex-1 bg-white/10" /></div>
                      {bestDrop.room && (
                        <Link href={`/room/${bestDrop.room.slug}`} className="flex items-center gap-2 mb-2 px-1">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: bestDrop.room.color }} />
                          <span className="text-[10px] font-black uppercase text-white/35 tracking-widest truncate">{bestDrop.room.title}</span>
                          <ChevronRight size={9} className="text-white/20 flex-shrink-0" />
                        </Link>
                      )}
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                        className="rounded-2xl border border-white/10 p-4 relative overflow-hidden"
                        style={{ background: `linear-gradient(135deg, ${bestDrop.room?.color || '#fac9f6'}10 0%, #0a0a0a 100%)`, borderLeft: `3px solid ${bestDrop.room?.color || '#fac9f6'}40` }}>
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                          <span className="text-[8px]">🏆</span><span className="text-[8px] font-black uppercase text-white/40">Top Drop</span>
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
                      <div className="flex items-center gap-2 mb-3"><div className="h-px flex-1 bg-white/10" /><span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">Today&apos;s Top Poll</span><div className="h-px flex-1 bg-white/10" /></div>
                      {bestPoll.room && (
                        <Link href={`/room/${bestPoll.room.slug}`} className="flex items-center gap-2 mb-2 px-1">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: bestPoll.room.color }} />
                          <span className="text-[10px] font-black uppercase text-white/35 tracking-widest truncate">{bestPoll.room.title}</span>
                          <ChevronRight size={9} className="text-white/20 flex-shrink-0" />
                        </Link>
                      )}
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
                        className="rounded-2xl border border-white/10 p-4 relative"
                        style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.07) 0%, #0a0a0a 100%)', borderLeft: '3px solid rgba(167,139,250,0.35)' }}>
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                          <BarChart2 size={8} className="text-[#a78bfa]" /><span className="text-[8px] font-black uppercase text-white/40">Top Poll</span>
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
                    <div className="flex items-center gap-3 mb-4"><div className="h-px flex-1 bg-white/10" /><span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">All Rooms</span><div className="h-px flex-1 bg-white/10" /></div>
                    {fetchError && rooms.length === 0 && (
                      <div className="flex flex-col items-center gap-3 py-10">
                        <p className="text-white/30 text-xs font-black uppercase tracking-widest">Connection issue</p>
                        <button onClick={() => fetchRooms(0)} className="text-[#fac9f6] text-xs font-black uppercase border border-[#fac9f6]/30 px-4 py-2 rounded-full">Tap to retry</button>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pb-24">
                      {!roomsLoaded && !fetchError && [...Array(6)].map((_, i) => <div key={i} className="aspect-square rounded-[2rem] bg-white/5 border border-white/10 animate-pulse" />)}
                      {roomsLoaded && filtered.map((room: any) => (
                        <RoomTile key={room._id} room={room} isSaved={savedIds.includes(room._id)} onSave={() => toggleSave(room._id)} onOpen={() => markRoomSeen(room._id)} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentIndex === 2 && (
                <div className="px-4 mt-7 flex flex-col items-center gap-5">
                  <div className="flex flex-col items-center">
                    <div onClick={() => setShowAvatarModal(true)} className="w-20 h-20 rounded-full border-4 border-[#fac9f6] p-1 cursor-pointer active:scale-95 transition-transform" style={{ boxShadow: '0 0 18px rgba(250,201,246,0.25)' }}>
                      <img src={`/avatars/${avatarIndex}.png`} className="w-full h-full rounded-full object-cover" alt="Avatar" />
                    </div>
                    <button onClick={() => setShowAvatarModal(true)} className="mt-1.5 text-[9px] font-black uppercase text-white/30 tracking-widest">Edit Bitmoji</button>
                  </div>
                  <div className={`flex items-center w-full h-11 bg-white/5 rounded-2xl border border-white/10 transition-all duration-300 ${searchOpen ? 'ring-1 ring-[#fac9f6]/30 bg-white/10' : ''}`}>
                    <button onClick={() => setSearchOpen(p => !p)} className="w-11 h-full flex items-center justify-center shrink-0">
                      <Search size={16} className={searchOpen ? 'text-[#fac9f6]' : 'text-white/40'} />
                    </button>
                    <AnimatePresence>
                      {searchOpen && (
                        <motion.input initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                          autoFocus className="flex-1 pr-4 outline-none text-sm bg-transparent text-white placeholder:text-white/20 font-medium min-w-0"
                          placeholder="Search saved rooms..." onChange={e => setSearchQuery(e.target.value)} />
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full pb-24">
                    {fetchError && rooms.length === 0 && (
                      <div className="col-span-2 flex flex-col items-center gap-3 py-10">
                        <p className="text-white/30 text-xs font-black uppercase tracking-widest">Connection issue</p>
                        <button onClick={() => fetchRooms(0)} className="text-[#fac9f6] text-xs font-black uppercase border border-[#fac9f6]/30 px-4 py-2 rounded-full">Tap to retry</button>
                      </div>
                    )}
                    {!roomsLoaded && !fetchError && [...Array(4)].map((_, i) => <div key={i} className="aspect-square rounded-[2rem] bg-white/5 border border-white/10 animate-pulse" />)}
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
                        <p className="text-white/20 text-xs font-black uppercase tracking-widest">No saved rooms yet</p>
                        <button onClick={() => paginate(1)} className="text-[#fac9f6] text-xs font-black uppercase mt-1">Browse rooms →</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentIndex === 3 && (
                <div className="mt-4">
                  <GameView onBack={() => paginate(2)} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {currentIndex === 2 && (
            <motion.button key="fab" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              onClick={() => setShowAddModal(true)}
              className="fixed bottom-7 right-5 w-14 h-14 bg-[#fac9f6] text-black rounded-full flex items-center justify-center shadow-2xl z-[60] active:scale-90 transition-transform">
              <Plus size={28} />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAddModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-end justify-center p-0"
              onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-[#0a0a0a] w-full max-w-md rounded-t-[2rem] px-5 pt-5 pb-10 border-t border-x border-white/10 relative shadow-2xl">
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
                <button onClick={() => setShowAddModal(false)} className="absolute top-5 right-5 text-white/40 p-1"><X size={20} /></button>
                <h2 className="text-xl font-black italic uppercase mb-5">Create Room</h2>
                <label className="text-[10px] font-black uppercase text-white/40 mb-1.5 block">Room Title</label>
                <input className="w-full border border-white/10 bg-black p-3.5 rounded-2xl mb-5 outline-none font-bold text-white placeholder:text-white/30 text-sm"
                  placeholder="E.g. Library Gossips" value={newRoom.title} onChange={e => setNewRoom({ ...newRoom, title: e.target.value })} />
                <label className="text-[10px] font-black uppercase text-white/40 mb-1.5 block">Theme Color</label>
                <input type="color" className="w-full h-11 rounded-xl mb-5 cursor-pointer" value={newRoom.color} onChange={e => setNewRoom({ ...newRoom, color: e.target.value })} />
                <p className="text-red-500 text-[10px] font-black uppercase mb-1">Don&apos;t forget to copy the link</p>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-3 rounded-xl mb-5">
                  <span className="text-[10px] text-white/50 font-mono truncate flex-1">blackbox-omega-peach.vercel.app/room/{newRoom.title.toLowerCase().replace(/ /g, '-')}</span>
                  <button onClick={() => {
                    navigator.clipboard.writeText(`blackbox-omega-peach.vercel.app/room/${newRoom.title.toLowerCase().replace(/ /g, '-')}`);
                    setCopiedCreate(true); setTimeout(() => setCopiedCreate(false), 2000);
                  }} className="shrink-0 p-1">
                    {copiedCreate ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-white/40" />}
                  </button>
                </div>
                <button onClick={handleCreateRoom} className="w-full bg-white text-black py-3.5 rounded-2xl font-black uppercase tracking-widest text-sm active:scale-95 transition-all">Create</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAvatarModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-end justify-center p-0"
              onClick={(e) => { if (e.target === e.currentTarget) setShowAvatarModal(false); }}>
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full max-w-md rounded-t-[2rem] px-5 pt-5 pb-10 border-t border-x border-white/10 max-h-[75vh] overflow-y-auto bg-[#0a0a0a]">
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-black uppercase italic">Pick Your Bitmoji</h2>
                  <button onClick={() => setShowAvatarModal(false)} className="text-white/40 p-1"><X size={20} /></button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(19)].map((_, i) => (
                    <div key={i} onClick={() => selectAvatar(i)}
                      className={`aspect-square rounded-full border-2 p-1 cursor-pointer transition-all active:scale-90 ${avatarIndex === i ? 'border-[#fac9f6] scale-110' : 'border-white/10'}`}>
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

"use client";

import { useRef, useState, useEffect, forwardRef, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { X, Copy, Check, ArrowLeft, BarChart2, Users, ShieldCheck } from "lucide-react";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";

/* ── primitives ─────────────────────────────────────────── */
const Cursor = () => (
  <motion.span
    className="inline-block w-[1.5px] h-[0.85em] bg-white/60 ml-[1px] align-middle"
    animate={{ opacity: [1, 0, 1] }}
    transition={{ duration: 0.85, repeat: Infinity }}
  />
);

const LiveDot = ({ color = "#ef4444" }: { color?: string }) => (
  <motion.span
    className="inline-block rounded-full shrink-0"
    style={{ width: 6, height: 6, background: color }}
    animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
    transition={{ duration: 1.4, repeat: Infinity }}
  />
);

const Card = forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string; style?: React.CSSProperties }>(
  ({ children, className = "", style = {} }, ref) => (
    <div ref={ref} className={`relative w-full rounded-[2rem] overflow-hidden border border-white/10 p-5 ${className}`} style={{ background: "#0a0a0a", ...style }}>
      {children}
    </div>
  )
);
Card.displayName = "Card";

const SectionLabel = ({ text }: { text: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20px 0px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4 }}
      className="flex items-center gap-3 px-6 mb-5 mt-8">
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">{text}</span>
      <div className="h-px flex-1 bg-white/10" />
    </motion.div>
  );
};

/* ── POSTER 1: Create Room ──────────────────────────────── */
function PosterCreateRoom({ onCreateRoom }: { onCreateRoom: () => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "0px 0px -40px 0px" });
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!inView) { setStep(0); setCopied(false); return; }
    const ts = [setTimeout(() => setStep(1), 500), setTimeout(() => setStep(2), 1500), setTimeout(() => setStep(3), 2300), setTimeout(() => setStep(4), 3000), setTimeout(() => setCopied(true), 3200), setTimeout(() => setStep(5), 3800)];
    return () => ts.forEach(clearTimeout);
  }, [inView]);
  return (
    <Card ref={ref as any}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#fac9f6]">Step 1</span>
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">— Create a Room</span>
      </div>
      <div className="rounded-[1.4rem] border-2 border-white/10 overflow-hidden" style={{ background: "#111" }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <span className="text-base font-black italic uppercase text-white">Create Room</span>
          <div className="w-6 h-6 flex items-center justify-center rounded-full border border-white/10"><X size={12} className="text-white/50" /></div>
        </div>
        <div className="px-5 pb-5 flex flex-col gap-3">
          <div>
            <p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1.5">Room Title</p>
            <div className="rounded-2xl border-2 border-black px-4 py-3 bg-black">
              <span className="text-sm font-bold text-white">{step >= 1 ? <>E.g. Library Gossips{step < 2 ? <Cursor /> : null}</> : <span className="text-white/20">E.g. Library Gossips</span>}</span>
            </div>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1.5">Theme Color</p>
            {step >= 2 ? <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.4 }} className="origin-left h-10 rounded-xl" style={{ background: "#22c55e" }} /> : <div className="h-10 rounded-xl bg-white/5" />}
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
          <div className="w-full py-3.5 rounded-2xl text-center text-xs font-black uppercase tracking-widest"
            style={{ background: step >= 5 ? "white" : "rgba(255,255,255,0.2)", color: step >= 5 ? "black" : "rgba(255,255,255,0.3)", transition: "all 0.4s" }}>
            {step >= 5 ? <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Create ✓</motion.span> : "Create"}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-white/35 mt-3 leading-relaxed">Go to <span className="text-[#fac9f6] font-black">Saved</span> tab → tap <span className="text-[#fac9f6] font-black">+</span> → name, color, copy link.</p>
      <button onClick={onCreateRoom} className="mt-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#fac9f6]">
        <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.1, repeat: Infinity }}>→</motion.span> Create your first room
      </button>
    </Card>
  );
}

/* ── POSTER 2: New Drop ─────────────────────────────────── */
function PosterNewDrop() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "0px 0px -40px 0px" });
  const [step, setStep] = useState(0);
  const fullText = "The canteen food today was lowkey fire ngl 🔥";
  const [typed, setTyped] = useState("");
  useEffect(() => {
    if (!inView) { setStep(0); setTyped(""); return; }
    const ts = [setTimeout(() => setStep(1), 400), setTimeout(() => setStep(2), 1100), setTimeout(() => setStep(3), 3200)];
    return () => ts.forEach(clearTimeout);
  }, [inView]);
  useEffect(() => {
    if (step < 2) { setTyped(""); return; }
    let i = 0; const iv = setInterval(() => { i++; setTyped(fullText.slice(0, i)); if (i >= fullText.length) clearInterval(iv); }, 38);
    return () => clearInterval(iv);
  }, [step]);
  return (
    <Card ref={ref as any}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#4ade80]">Step 2</span>
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">— Drop a Message</span>
      </div>
      <div className="rounded-[1.4rem] border-2 border-white/10 overflow-hidden" style={{ background: "#111" }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <span className="text-base font-black italic uppercase text-white">New Drop</span>
          <div className="w-6 h-6 flex items-center justify-center rounded-full border border-white/10"><X size={12} className="text-white/50" /></div>
        </div>
        <div className="px-5 pb-5 flex flex-col gap-3">
          <div className="rounded-2xl border border-white/10 px-4 py-3 bg-white/[0.04]">
            <span className="text-sm text-white/40">{step >= 1 ? <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/70">Anonymous{step < 2 ? <Cursor /> : null}</motion.span> : "Display Name..."}</span>
          </div>
          <div className="rounded-2xl border border-white/10 px-4 py-3 min-h-[80px] flex flex-col justify-between bg-white/[0.04]">
            <span className="text-sm text-white/80 leading-snug break-words">{typed || <span className="text-white/20">What&apos;s the tea?</span>}{step >= 2 && typed.length < fullText.length && <Cursor />}</span>
            {step >= 2 && <span className="text-[9px] text-white/20 text-right mt-1">{typed.length}/400</span>}
          </div>
          <div className="w-full py-3.5 rounded-2xl text-center text-xs font-black uppercase tracking-widest"
            style={{ background: step >= 3 ? "white" : "rgba(255,255,255,0.15)", color: step >= 3 ? "black" : "rgba(255,255,255,0.3)", transition: "all 0.4s" }}>
            {step >= 3 ? <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Drop It ✓</motion.span> : "Drop It"}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-white/35 mt-3 leading-relaxed">Open any room → tap <span className="text-[#4ade80] font-black">+</span> → type freely. No account needed.</p>
    </Card>
  );
}

/* ── POSTER 3: Moderation ───────────────────────────────── */
function PosterModeration() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "0px 0px -40px 0px" });
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");
  const bad = "fuck";
  useEffect(() => {
    if (!inView) { setStep(0); setTyped(""); return; }
    const ts = [setTimeout(() => setStep(1), 400), setTimeout(() => setStep(2), 900), setTimeout(() => setStep(3), 2000), setTimeout(() => setStep(4), 2700)];
    return () => ts.forEach(clearTimeout);
  }, [inView]);
  useEffect(() => {
    if (step < 2) { setTyped(""); return; }
    let i = 0; const iv = setInterval(() => { i++; setTyped(bad.slice(0, i)); if (i >= bad.length) clearInterval(iv); }, 90);
    return () => clearInterval(iv);
  }, [step]);
  const blocked = step >= 3;
  return (
    <Card ref={ref as any}>
      <motion.div className="absolute inset-x-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent 0%, #ef4444 50%, transparent 100%)", opacity: 0.3 }}
        animate={{ top: ["8%", "92%", "8%"] }} transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }} />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#f87171]">Always On</span>
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">— AI Shield</span>
          <div className="ml-auto flex items-center gap-1.5">
            <motion.span className="inline-block rounded-full shrink-0" style={{ width: 6, height: 6, background: "#ef4444" }} animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.4, repeat: Infinity }} />
            <span className="text-[8px] font-black uppercase text-white/25">Active</span>
          </div>
        </div>
        <div className="rounded-[1.4rem] border-2 border-white/10 overflow-hidden" style={{ background: "#111" }}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <span className="text-base font-black italic uppercase text-white">New Drop</span>
            <div className="w-6 h-6 flex items-center justify-center rounded-full border border-white/10"><X size={12} className="text-white/50" /></div>
          </div>
          <div className="px-5 pb-5 flex flex-col gap-3">
            <div className="rounded-2xl border border-white/10 px-4 py-3 bg-white/[0.04]"><span className="text-sm text-white/40">Display Name...</span></div>
            <motion.div animate={{ borderColor: blocked ? "rgb(239,68,68)" : "rgba(255,255,255,0.1)" }} transition={{ duration: 0.3 }}
              className="rounded-2xl border px-4 py-3 min-h-[72px] flex flex-col justify-between bg-white/[0.04]">
              <span className="text-sm leading-snug break-words" style={{ color: blocked ? "#f87171" : "rgba(255,255,255,0.8)" }}>
                {step >= 2 ? typed : <span className="text-white/20">What&apos;s the tea?</span>}
                {step >= 2 && step < 3 && typed.length < bad.length && <Cursor />}
              </span>
              {step >= 2 && <span className="text-[9px] text-white/20 text-right mt-1">{typed.length}/400</span>}
            </motion.div>
            <AnimatePresence>
              {blocked && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[9px] font-black uppercase text-red-500 tracking-widest -mt-1">Abusive language is not allowed.</motion.p>}
            </AnimatePresence>
            <div className="w-full py-3.5 rounded-2xl text-center text-xs font-black uppercase tracking-widest bg-white text-black">Drop It</div>
          </div>
        </div>
        {step >= 4 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-2 mt-3">
            <div className="rounded-xl p-3 border border-red-500/20 bg-red-500/[0.06]">
              <p className="text-[8px] font-black uppercase text-red-400/60 mb-2">Blocked ✗</p>
              {["Slurs", "Hate speech", "Threats", "400+ patterns"].map((w, i) => (
                <motion.div key={w} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }} className="mb-1"><span className="text-[8px] text-red-400/80 line-through">{w}</span></motion.div>
              ))}
            </div>
            <div className="rounded-xl p-3 border border-green-500/20 bg-green-500/[0.05]">
              <p className="text-[8px] font-black uppercase text-green-400/60 mb-2">Allowed ✓</p>
              {["Honest rants", "Opinions", "Criticism", "Emojis 🔥"].map((w, i) => (
                <motion.div key={w} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.08 }} className="mb-1"><span className="text-[8px] text-green-400/80">{w}</span></motion.div>
              ))}
            </div>
          </motion.div>
        )}
        <p className="text-[10px] text-white/35 mt-3 leading-relaxed">Every drop scanned against <span className="text-[#f87171] font-black">400+ abuse patterns</span>. Toxic content rejected before reaching the feed.</p>
      </div>
    </Card>
  );
}

/* ── POSTER 4: Polls ────────────────────────────────────── */
function PosterPolls() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "0px 0px -40px 0px" });
  const [step, setStep] = useState(0);
  const options = ["Library rooftop 🌆", "Canteen corner 🍕", "Basketball court 🏀", "Park outside 🌿"];
  const votes = [12, 8, 5, 3]; const total = 28;
  useEffect(() => {
    if (!inView) { setStep(0); return; }
    const ts = [setTimeout(() => setStep(1), 500), setTimeout(() => setStep(2), 1200), setTimeout(() => setStep(3), 2000), setTimeout(() => setStep(4), 2800)];
    return () => ts.forEach(clearTimeout);
  }, [inView]);
  return (
    <Card ref={ref as any}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 size={12} className="text-[#a78bfa]" />
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#a78bfa]">Step 3</span>
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">— Create a Poll</span>
      </div>
      <div className="rounded-[1.4rem] border border-white/10 p-4" style={{ background: "#111" }}>
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
                {step >= 4 && <motion.div className="absolute inset-y-0 left-0 rounded-xl" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} style={{ background: sel ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.06)" }} />}
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
        {step >= 4 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-3"><Users size={10} className="text-white/30" /><span className="text-[9px] text-white/30 font-bold">{total} votes</span></motion.div>}
      </div>
      <p className="text-[10px] text-white/35 mt-3 leading-relaxed">Tap <span className="text-[#a78bfa] font-black">+</span> → choose <span className="text-[#a78bfa] font-black">Poll</span> → add question + up to 4 options. Results show live.</p>
    </Card>
  );
}

/* ── Developer Profile ──────────────────────────────────── */
function DevProfile() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
      className="mx-6 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(250,201,246,0.08)]" style={{ background: "#0a0a0a" }}>
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
          <a href="https://www.linkedin.com/in/daksh-vasani/" target="_blank" className="flex-1 flex items-center justify-center p-4 bg-[#0077b5]/10 border border-[#0077b5]/20 rounded-2xl text-[#0077b5]"><FaLinkedin size={18} /></a>
          <a href="https://www.instagram.com/wasitreallydaksh" target="_blank" className="flex-1 flex items-center justify-center p-4 bg-pink-500/10 border border-pink-500/20 rounded-2xl text-pink-500"><FaInstagram size={18} /></a>
        </div>
        <p className="mt-6 text-[8px] font-black text-white/20 uppercase tracking-widest">© 2026 Black Box Protocol</p>
      </div>
    </motion.div>
  );
}

/* ── PAGE ───────────────────────────────────────────────── */
export default function IntroPage() {
  const router = useRouter();

  // ── SWIPE HANDLER ──
  // Chain: /intro ← browse ← saved ← /game
  // Swipe LEFT  = enter the app (go to / which defaults to saved tab)
  // Swipe RIGHT = already at the leftmost edge, do nothing
  const handleSwipe = useCallback((_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const isSwipe = Math.abs(info.offset.x) > 50 || Math.abs(info.velocity.x) > 300;
    if (!isSwipe) return;
    if (info.offset.x < 0) {
      // Swipe LEFT → enter the app, land on saved tab (default home)
      router.push('/');
    }
    // Swipe RIGHT on intro = leftmost edge, no action
  }, [router]);

  return (
    <motion.main
      className="min-h-screen pb-24 bg-black"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDragEnd={handleSwipe}
    >
      {/* HEADER */}
      <header className="px-6 pt-8 pb-4 flex items-center gap-4 sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/10">
        <button onClick={() => router.back()} className="p-2 border border-white/20 rounded-xl bg-black">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-black tracking-tighter">
          B<span style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>L</span>ACK BOX
        </h1>

        <div className="ml-auto flex items-center">
          <motion.div
            layoutId="nav-capsule"
            className="relative flex items-center bg-[#111] border border-white/10 rounded-full p-1"
            style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)' }}
          >
          </motion.div>
        </div>
      </header>

      {/* SWIPE HINT */}
      <motion.div
        className="flex items-center justify-end gap-1.5 px-6 pt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Swipe left to enter</span>
        <motion.span
          className="text-white/20 text-xs"
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >→</motion.span>
      </motion.div>

      {/* HERO */}
      <div className="px-6 pt-4 pb-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="rounded-[2rem] p-6 border border-white/10 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #111 100%)" }}>
          <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(250,201,246,0.15), transparent 60%)" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <LiveDot color="#fac9f6" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Anonymous Platform</span>
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white mb-2 leading-tight">The Anonymous<br />Gossip Platform</h2>
            <p className="text-[11px] text-white/50 leading-relaxed">Built for college & school students to chat, rant, and gossip freely — no accounts, no identity, no judgment.</p>
          </div>
        </motion.div>
      </div>

      <SectionLabel text="How It Works" />
      <div className="px-6 flex flex-col gap-4">
        <PosterCreateRoom onCreateRoom={() => router.push('/?action=create')} />
        <PosterNewDrop />
        <PosterModeration />
        <PosterPolls />
      </div>

      <SectionLabel text="The Builder" />
      <DevProfile />
    </motion.main>
  );
}

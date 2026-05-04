"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { X, Copy, Check } from "lucide-react";
import { forwardRef } from "react";
/* ══════════════════════════════════════════════════════════
   SHARED PRIMITIVES
══════════════════════════════════════════════════════════ */

/** Blinking cursor matching the app's input style */
const Cursor = () => (
  <motion.span
    className="inline-block w-[1.5px] h-[0.85em] bg-white/60 ml-[1px] align-middle"
    animate={{ opacity: [1, 0, 1] }}
    transition={{ duration: 0.85, repeat: Infinity }}
  />
);

/** Pulsing live dot */
const LiveDot = ({ color = "#ef4444" }: { color?: string }) => (
  <motion.span
    className="inline-block rounded-full shrink-0"
    style={{ width: 6, height: 6, background: color }}
    animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
    transition={{ duration: 1.4, repeat: Infinity }}
  />
);

/** Shared card shell — matches the dark #0a0a0a modal in the screenshots */

const Card = forwardRef<HTMLDivElement, {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}>(({ children, className = "", style = {} }, ref) => (
  <div
    ref={ref}
    className={`relative w-full max-w-full rounded-[2rem] overflow-hidden border border-white/10 p-5 ${className}`}
    style={{ background: "#0a0a0a", ...style }}
  >
    {children}
  </div>
));

Card.displayName = "Card";

/** Section divider — "HOW IT WORKS" / "ALL ROOMS" */
const SectionLabel = ({ text }: { text: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20px 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-3 px-6 mb-5 mt-8"
    >
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">
        {text}
      </span>
      <div className="h-px flex-1 bg-white/10" />
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════
   POSTER 1 — CREATE ROOM
   Recreates the exact "CREATE ROOM" modal from screenshot 1
══════════════════════════════════════════════════════════ */
function PosterCreateRoom({ onCreateRoom }: { onCreateRoom: () => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "0px 0px -40px 0px" });
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);

  // Replay every time card enters view
  useEffect(() => {
    if (!inView) { setStep(0); setCopied(false); return; }
    const t1 = setTimeout(() => setStep(1), 500);   // title typed
    const t2 = setTimeout(() => setStep(2), 1500);  // color appears
    const t3 = setTimeout(() => setStep(3), 2300);  // link row
    const t4 = setTimeout(() => setStep(4), 3000);  // copy flashes
    const t5 = setTimeout(() => setCopied(true), 3200);
    const t6 = setTimeout(() => setStep(5), 3800);  // create button
    return () => [t1,t2,t3,t4,t5,t6].forEach(clearTimeout);
  }, [inView]);

  const slug = "library-gossips";

  return (
    <Card ref={ref as any} className="col-span-2">
      {/* Step badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#fac9f6]">Step 1</span>
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">— Create a Room</span>
      </div>

      {/* ── Exact modal replica ── */}
      <div className="rounded-[1.4rem] border-2 border-white/10 overflow-hidden" style={{ background: "#111111" }}>
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <span className="text-base font-black italic uppercase tracking-tight text-white">Create Room</span>
          <div className="w-6 h-6 flex items-center justify-center rounded-full border border-white/10">
            <X size={12} className="text-white/50" />
          </div>
        </div>

        <div className="px-5 pb-5 flex flex-col gap-3">
          {/* Room title label + input */}
          <div>
            <p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1.5">Room Title</p>
            <div className="rounded-2xl border-2 border-black px-4 py-3" style={{ background: "#000" }}>
              <span className="text-sm font-bold text-white">
                {step >= 1 ? (
                  <>E.g. Library Gossips{step < 2 ? <Cursor /> : null}</>
                ) : (
                  <span className="text-white/20">E.g. Library Gossips</span>
                )}
              </span>
            </div>
          </div>

          {/* Theme color label + swatch */}
          <div>
            <p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1.5">Theme Color</p>
            {step >= 2 ? (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="origin-left h-10 rounded-xl"
                style={{ background: "#22c55e" }}
              />
            ) : (
              <div className="h-10 rounded-xl bg-white/5 border border-white/5" />
            )}
          </div>

          {/* Link row */}
          {step >= 3 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-[9px] font-black uppercase text-red-500 tracking-widest mb-1.5">
                Do not forget to copy the link
              </p>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)" }}>
                <span className="text-[9px] font-mono text-white/50 flex-1 break-all">
                  blackbox-omega-peach.vercel.app/room/{slug}
                </span>
                <motion.div animate={step >= 4 ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
                  {copied
                    ? <Check size={13} className="text-green-400" />
                    : <Copy size={13} className="text-white/40" />
                  }
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Create button */}
          {step >= 5 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260 }}
              className="w-full py-3.5 rounded-2xl text-center text-xs font-black uppercase tracking-widest text-black"
              style={{ background: "white" }}
            >
              Create ✓
            </motion.div>
          ) : (
            <div className="w-full py-3.5 rounded-2xl text-center text-xs font-black uppercase tracking-widest text-black/40 bg-white/20">
              Create
            </div>
          )}
        </div>
      </div>

      {/* Caption */}
      <p className="text-[10px] text-white/35 mt-3 leading-relaxed font-medium">
        Go to <span className="text-[#fac9f6] font-black">Saved</span> tab → tap <span className="text-[#fac9f6] font-black">+</span> → name your room, pick a color, copy the link and share it.
      </p>

      {/* Live CTA */}
      <button
        onClick={onCreateRoom}
        className="mt-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#fac9f6] active:scale-95 transition-transform"
      >
        <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.1, repeat: Infinity }}>→</motion.span>
        Create your first room
      </button>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════════
   POSTER 2 — NEW DROP
   Recreates the exact "NEW DROP" modal from screenshot 2
══════════════════════════════════════════════════════════ */
function PosterNewDrop() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "0px 0px -40px 0px" });
  const [step, setStep] = useState(0);

  const fullText = "The canteen food today was lowkey fire ngl 🔥";
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!inView) { setStep(0); setTyped(""); return; }
    const t1 = setTimeout(() => setStep(1), 400);   // display name
    const t2 = setTimeout(() => setStep(2), 1100);  // start typing body
    const t3 = setTimeout(() => setStep(3), 3200);  // drop it button
    return () => [t1,t2,t3].forEach(clearTimeout);
  }, [inView]);

  // Typewriter for body
  useEffect(() => {
    if (step < 2) { setTyped(""); return; }
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(interval);
    }, 38);
    return () => clearInterval(interval);
  }, [step]);

  const charCount = typed.length;

  return (
    <Card ref={ref as any} className="col-span-2">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#4ade80]">Step 2</span>
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">— Drop a Message</span>
      </div>

      {/* Modal replica */}
      <div className="rounded-[1.4rem] border-2 border-white/10 overflow-hidden" style={{ background: "#111111" }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <span className="text-base font-black italic uppercase tracking-tight text-white">New Drop</span>
          <div className="w-6 h-6 flex items-center justify-center rounded-full border border-white/10">
            <X size={12} className="text-white/50" />
          </div>
        </div>

        <div className="px-5 pb-5 flex flex-col gap-3">
          {/* Display name */}
          <div className="rounded-2xl border border-white/10 px-4 py-3" style={{ background: "rgba(255,255,255,0.04)" }}>
            <span className="text-sm text-white/40 font-medium">
              {step >= 1 ? (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/70">
                  Anonymous{step < 2 ? <Cursor /> : null}
                </motion.span>
              ) : "Display Name..."}
            </span>
          </div>

          {/* Message body */}
          <div className="rounded-2xl border border-white/10 px-4 py-3 min-h-[80px] flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.04)" }}>
            <span className="text-sm text-white/80 font-medium leading-snug block break-words">
              {typed || <span className="text-white/20">What's the tea?</span>}
              {step >= 2 && typed.length < fullText.length && <Cursor />}
            </span>
            {step >= 2 && (
              <span className="text-[9px] text-white/20 text-right mt-1 font-mono">{charCount}/400</span>
            )}
          </div>

          {/* Drop it button */}
          <div
            className="w-full py-3.5 rounded-2xl text-center text-xs font-black uppercase tracking-widest"
            style={{ background: step >= 3 ? "white" : "rgba(255,255,255,0.15)", color: step >= 3 ? "black" : "rgba(255,255,255,0.3)", transition: "all 0.4s" }}
          >
            {step >= 3 ? (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Drop It ✓</motion.span>
            ) : "Drop It"}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-white/35 mt-3 leading-relaxed font-medium">
        Open any room → tap the <span className="text-[#4ade80] font-black">+</span> → type freely. Pick any display name or stay <span className="text-[#4ade80] font-black">Anonymous</span>. No account needed.
      </p>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════════
   POSTER 3 — ABUSIVE LANGUAGE BLOCKED
   Recreates screenshot 3 — red border, error message
══════════════════════════════════════════════════════════ */
function PosterModeration() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "0px 0px -40px 0px" });
  const [step, setStep] = useState(0);

  const badText = "fuck";
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!inView) { setStep(0); setTyped(""); return; }
    const t1 = setTimeout(() => setStep(1), 400);
    const t2 = setTimeout(() => setStep(2), 900);   // type bad word
    const t3 = setTimeout(() => setStep(3), 2000);  // red border + error
    const t4 = setTimeout(() => setStep(4), 2700);  // show alternatives
    return () => [t1,t2,t3,t4].forEach(clearTimeout);
  }, [inView]);

  useEffect(() => {
    if (step < 2) { setTyped(""); return; }
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(badText.slice(0, i));
      if (i >= badText.length) clearInterval(interval);
    }, 90);
    return () => clearInterval(interval);
  }, [step]);

  const isBlocked = step >= 3;

  return (
    <Card ref={ref as any} className="col-span-2">
      {/* Animated scan line */}
      <motion.div
        className="absolute inset-x-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent 0%, #ef4444 50%, transparent 100%)", opacity: 0.35 }}
        animate={{ top: ["8%", "92%", "8%"] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#f87171]">Always On</span>
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">— AI Shield</span>
          <div className="ml-auto flex items-center gap-1.5">
            <LiveDot color="#ef4444" />
            <span className="text-[8px] font-black uppercase text-white/25 tracking-widest">Active</span>
          </div>
        </div>

        {/* Modal replica */}
        <div className="rounded-[1.4rem] border-2 border-white/10 overflow-hidden" style={{ background: "#111111" }}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <span className="text-base font-black italic uppercase tracking-tight text-white">New Drop</span>
            <div className="w-6 h-6 flex items-center justify-center rounded-full border border-white/10">
              <X size={12} className="text-white/50" />
            </div>
          </div>

          <div className="px-5 pb-5 flex flex-col gap-3">
            {/* Display name */}
            <div className="rounded-2xl border border-white/10 px-4 py-3" style={{ background: "rgba(255,255,255,0.04)" }}>
              <span className="text-sm text-white/40 font-medium">Display Name...</span>
            </div>

            {/* Message body — turns red when blocked */}
            <motion.div
              animate={{ borderColor: isBlocked ? "rgb(239,68,68)" : "rgba(255,255,255,0.1)" }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border px-4 py-3 min-h-[72px] flex flex-col justify-between"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <span className="text-sm font-medium leading-snug block break-words" style={{ color: isBlocked ? "#f87171" : "rgba(255,255,255,0.8)" }}>
                {step >= 2 ? typed : <span className="text-white/20">What's the tea?</span>}
                {step >= 2 && step < 3 && typed.length < badText.length && <Cursor />}
              </span>
              <span className="text-[9px] text-white/20 text-right mt-1 font-mono">
                {step >= 2 ? `${typed.length}/400` : ""}
              </span>
            </motion.div>

            {/* Error message */}
            <AnimatePresence>
              {isBlocked && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[9px] font-black uppercase text-red-500 tracking-widest -mt-1"
                >
                  Abusive language is not allowed.
                </motion.p>
              )}
            </AnimatePresence>

            {/* Drop it button */}
            <div
              className="w-full py-3.5 rounded-2xl text-center text-xs font-black uppercase tracking-widest"
              style={{ background: "white", color: "black" }}
            >
              Drop It
            </div>
          </div>
        </div>

        {/* What's allowed vs blocked */}
        {step >= 4 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="grid grid-cols-2 gap-2 mt-3">
            <div className="rounded-xl p-3 border border-red-500/20" style={{ background: "rgba(239,68,68,0.06)" }}>
              <p className="text-[8px] font-black uppercase text-red-400/60 mb-2 tracking-widest">Blocked ✗</p>
              {["Slurs", "Hate speech", "Threats", "400+ patterns"].map((w, i) => (
                <motion.div key={w} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-1 mb-1">
                  <span className="text-[8px] text-red-400/80 font-mono line-through">{w}</span>
                </motion.div>
              ))}
            </div>
            <div className="rounded-xl p-3 border border-green-500/20" style={{ background: "rgba(74,222,128,0.05)" }}>
              <p className="text-[8px] font-black uppercase text-green-400/60 mb-2 tracking-widest">Allowed ✓</p>
              {["Honest rants", "Opinions", "Criticism", "Emojis 🔥"].map((w, i) => (
                <motion.div key={w} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-1 mb-1">
                  <span className="text-[8px] text-green-400/80 font-medium">{w}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <p className="text-[10px] text-white/35 mt-3 leading-relaxed font-medium">
          Every drop is scanned in real-time against <span className="text-[#f87171] font-black">400+ abuse patterns</span> — including leetspeak like <span className="font-mono text-red-400/70 text-[9px]">f*ck</span>, <span className="font-mono text-red-400/70 text-[9px]">sh!t</span> and phonetic variants. Toxic drops are rejected before they ever reach the feed.
        </p>
      </div>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════════
   POSTER 4 — REPLY TO DROPS
══════════════════════════════════════════════════════════ 

/* ══════════════════════════════════════════════════════════
   ROOT EXPORT
══════════════════════════════════════════════════════════ */
export default function OnboardingPosters({ onCreateRoom }: { onCreateRoom: () => void }) {
  return (
    <div className="w-full">
      <SectionLabel text="How It Works" />

      <div className="px-6 flex flex-col gap-4">
        <PosterCreateRoom onCreateRoom={onCreateRoom} />
        <PosterNewDrop />
        <PosterModeration />
      </div>

      <SectionLabel text="All Rooms" />
    </div>
  );
}

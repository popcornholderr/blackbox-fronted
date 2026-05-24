"use client";

import { useRef, useState, useEffect, forwardRef, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { X, Copy, Check, ArrowLeft, BarChart2, Users, ShieldCheck, Lock, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

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

/* ── POSTER 3: Adult Rooms ──────────────────────────────── */
function PosterAdultRoom() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "0px 0px -40px 0px" });
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!inView) { setStep(0); return; }
    const ts = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 2200),
    ];
    return () => ts.forEach(clearTimeout);
  }, [inView]);

  return (
    <Card ref={ref as any}>
      {/* subtle red shimmer */}
      <motion.div
        className="absolute inset-x-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent 0%, #ef4444 50%, transparent 100%)", opacity: 0.2 }}
        animate={{ top: ["10%", "90%", "10%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#f87171]">Step 3</span>
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">— Adult Rooms</span>
          <span className="ml-auto text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400">18+ Only</span>
        </div>

        <div className="rounded-[1.4rem] border-2 border-white/10 overflow-hidden" style={{ background: "#111" }}>
          <div className="px-5 pt-5 pb-4 flex flex-col gap-3">
            <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">Room Type</p>
            <div className="grid grid-cols-2 gap-2">
              {/* Safe Room */}
              <motion.div
                animate={step >= 1 ? { borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)" } : {}}
                className="flex flex-col items-start gap-1 p-3 rounded-2xl border border-white/10 bg-white/[0.02]"
              >
                <span className="text-lg">🛡️</span>
                <span className="text-[11px] font-black text-white/60">Safe Room</span>
                <span className="text-[9px] text-white/25">Language filtered</span>
              </motion.div>
              {/* Adult Room — animates to selected */}
              <motion.div
                animate={step >= 1
                  ? { borderColor: "rgba(239,68,68,0.5)", background: "rgba(239,68,68,0.08)" }
                  : { borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-start gap-1 p-3 rounded-2xl border"
              >
                <span className="text-lg">🔞</span>
                <span className="text-[11px] font-black text-white/80">Adult Room</span>
                <span className="text-[9px] text-white/35">18+ only, unfiltered</span>
              </motion.div>
            </div>

            {/* Warning banner */}
            <AnimatePresence>
              {step >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5"
                >
                  <ShieldAlert size={13} className="text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-yellow-300/60 leading-relaxed">Adult language allowed. CSAM and terrorism-related content are <span className="text-yellow-300/90 font-black">always blocked</span>.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* What's different */}
            <AnimatePresence>
              {step >= 3 && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl p-3 border border-red-500/20 bg-red-500/[0.05]">
                    <p className="text-[8px] font-black uppercase text-red-400/60 mb-2">Unlocked 🔓</p>
                    {["Strong language", "Adult humour", "Unfiltered rants", "Dark jokes"].map((w, i) => (
                      <motion.div key={w} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07 }} className="mb-1">
                        <span className="text-[8px] text-red-400/80">✓ {w}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="rounded-xl p-3 border border-white/10 bg-white/[0.03]">
                    <p className="text-[8px] font-black uppercase text-white/30 mb-2">Still Blocked ✗</p>
                    {["CSAM", "Terrorism content", "Doxxing", "Real threats"].map((w, i) => (
                      <motion.div key={w} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 + i * 0.07 }} className="mb-1">
                        <span className="text-[8px] text-white/30 line-through">{w}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-[10px] text-white/35 mt-3 leading-relaxed">
          Creating a room? Choose <span className="text-[#f87171] font-black">Adult Room</span> to allow unfiltered conversation — strict safety rules still apply.
        </p>
      </div>
    </Card>
  );
}

/* ── POSTER 4: Private Rooms ────────────────────────────── */
function PosterPrivateRoom() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "0px 0px -40px 0px" });
  const [step, setStep] = useState(0);
  const [typedCode, setTypedCode] = useState("");
  const code = "blackbox123";

  useEffect(() => {
    if (!inView) { setStep(0); setTypedCode(""); return; }
    const ts = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1100),
      setTimeout(() => setStep(3), 2000),
      setTimeout(() => setStep(4), 3200),
    ];
    return () => ts.forEach(clearTimeout);
  }, [inView]);

  useEffect(() => {
    if (step < 3) { setTypedCode(""); return; }
    let i = 0;
    const iv = setInterval(() => { i++; setTypedCode(code.slice(0, i)); if (i >= code.length) clearInterval(iv); }, 80);
    return () => clearInterval(iv);
  }, [step]);

  return (
    <Card ref={ref as any}>
      <div className="flex items-center gap-2 mb-4">
        <Lock size={11} className="text-[#60a5fa]" />
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#60a5fa]">Step 4</span>
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">— Private Rooms</span>
      </div>

      <div className="rounded-[1.4rem] border-2 border-white/10 overflow-hidden" style={{ background: "#111" }}>
        <div className="px-5 pt-5 pb-4 flex flex-col gap-3">
          <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">Visibility</p>
          <div className="grid grid-cols-2 gap-2">
            {/* Public */}
            <div className="flex flex-col items-start gap-1 p-3 rounded-2xl border border-white/10 bg-white/[0.02]">
              <span className="text-lg">🌐</span>
              <span className="text-[11px] font-black text-white/60">Public</span>
              <span className="text-[9px] text-white/25">Anyone can join</span>
            </div>
            {/* Private — animates to selected */}
            <motion.div
              animate={step >= 1
                ? { borderColor: "rgba(96,165,250,0.5)", background: "rgba(96,165,250,0.07)" }
                : { borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-start gap-1 p-3 rounded-2xl border"
            >
              <span className="text-lg">🔒</span>
              <span className="text-[11px] font-black text-white/80">Private</span>
              <span className="text-[9px] text-white/35">Invite only</span>
            </motion.div>
          </div>

          {/* Admin code field */}
          <AnimatePresence>
            {step >= 2 && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-[9px] font-black uppercase text-[#60a5fa]/70 tracking-widest mb-1.5 flex items-center gap-1">
                  <Lock size={9} /> Admin Code <span className="text-white/25 normal-case font-medium">(keep this secret)</span>
                </p>
                <motion.div
                  animate={step >= 3 ? { borderColor: "rgba(96,165,250,0.4)" } : { borderColor: "rgba(255,255,255,0.1)" }}
                  className="rounded-2xl border px-4 py-3 bg-black"
                >
                  <span className="text-sm font-bold tracking-[0.15em] text-white">
                    {typedCode || <span className="text-white/20 tracking-normal font-normal">E.g. blackbox123</span>}
                    {step >= 3 && typedCode.length < code.length && <Cursor />}
                  </span>
                </motion.div>
                <p className="text-[8px] text-white/25 mt-1.5">Enter this code on the room page to manage join requests.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confirmed state */}
          <AnimatePresence>
            {step >= 4 && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#60a5fa]/20 bg-[#60a5fa]/[0.06]">
                <Check size={12} className="text-[#60a5fa] shrink-0" />
                <p className="text-[9px] font-black uppercase text-[#60a5fa]/80 tracking-wide">Room locked — share the link to invite only</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-[10px] text-white/35 mt-3 leading-relaxed">
        Private rooms are <span className="text-[#60a5fa] font-black">invite-only</span>. Share the link with your crew — outsiders need your approval to join.
      </p>
    </Card>
  );
}

/* ── POSTER 5: Moderation ───────────────────────────────── */
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

/* ── POSTER 6: Polls ────────────────────────────────────── */
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
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#a78bfa]">Step 5</span>
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

/* ── PAGE ───────────────────────────────────────────────── */
export default function IntroPage() {
  const router = useRouter();

  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const [swiping, setSwiping] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const navigateHome = useCallback(() => {
    if (leaving) return;
    setLeaving(true);
    sessionStorage.setItem('hasSeenIntro', 'true');
    router.push('/');
  }, [router, leaving]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    setSwiping(false);
    setSwipeX(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartXRef.current;
    const dy = Math.abs(e.touches[0].clientY - touchStartYRef.current);
    if (dy > 20 && !swiping) return;
    if (dx < 0) {
      setSwiping(true);
      setSwipeX(dx);
    }
  }, [swiping]);

  const handleTouchEnd = useCallback(() => {
    if (swipeX < -80) {
      navigateHome();
    } else {
      setSwiping(false);
      setSwipeX(0);
    }
  }, [swipeX, navigateHome]);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <AnimatePresence>
        {leaving && (
          <motion.div
            className="fixed inset-0 z-[300] bg-black"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="min-h-screen pb-24"
        style={{
          x: swiping ? Math.max(swipeX * 0.4, -80) : 0,
          transition: swiping ? 'none' : 'transform 0.3s ease',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* HEADER */}
        <header className="px-6 pt-8 pb-4 flex items-center gap-4 sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/10">
          <button onClick={() => router.back()} className="p-2 border border-white/20 rounded-xl bg-black active:scale-90 transition-transform">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-black tracking-tighter">
            B<span style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>L</span>ACK BOX
          </h1>
          <button
            onClick={navigateHome}
            className="ml-auto flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#fac9f6] border border-[#fac9f6]/30 rounded-full px-3 py-1.5 active:scale-95 transition-transform"
          >
            <span>Enter</span>
            <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.1, repeat: Infinity }}>→</motion.span>
          </button>
        </header>

        {/* SWIPE HINT */}
        <motion.div
          className="flex items-center justify-center gap-2 px-6 pt-4 pb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <motion.div
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5"
            animate={{ x: [0, -6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Swipe left to browse</span>
            <span className="text-white/30 text-sm">←</span>
          </motion.div>
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
              <button
                onClick={navigateHome}
                className="mt-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#fac9f6]"
              >
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity }}>→</motion.span>
                Start browsing rooms
              </button>
            </div>
          </motion.div>
        </div>

        <SectionLabel text="How It Works" />
        <div className="px-6 flex flex-col gap-4">
          <PosterCreateRoom onCreateRoom={() => { sessionStorage.setItem('hasSeenIntro', 'true'); router.push('/?action=create'); }} />
          <PosterNewDrop />
          <PosterAdultRoom />
          <PosterPrivateRoom />
          <PosterModeration />
          <PosterPolls />
        </div>

        {/* Bottom CTA */}
        <div className="px-6 mt-8 pb-8">
          <button
            onClick={navigateHome}
            className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Browse Rooms</span>
            <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity }}>→</motion.span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

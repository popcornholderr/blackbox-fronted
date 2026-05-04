"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────
   Tiny reusable animated elements
───────────────────────────────────────────── */

/** Pulsing dot */
const Dot = ({ color = "#fac9f6", size = 8, delay = 0 }: { color?: string; size?: number; delay?: number }) => (
  <motion.div
    className="rounded-full shrink-0"
    style={{ width: size, height: size, background: color }}
    animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
    transition={{ duration: 1.6, repeat: Infinity, delay }}
  />
);

/** Animated typing cursor */
const Cursor = () => (
  <motion.span
    className="inline-block w-[2px] h-[1em] bg-[#fac9f6] ml-0.5 align-middle"
    animate={{ opacity: [1, 0, 1] }}
    transition={{ duration: 0.9, repeat: Infinity }}
  />
);

/** Fake message bubble */
const Bubble = ({
  text, align = "left", color = "rgba(255,255,255,0.07)", delay = 0, textColor = "rgba(255,255,255,0.8)"
}: { text: string; align?: "left" | "right"; color?: string; delay?: number; textColor?: string }) => (
  <motion.div
    initial={{ opacity: 0, x: align === "left" ? -16 : 16, scale: 0.92 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    transition={{ delay, duration: 0.4, type: "spring", stiffness: 200 }}
    className={`max-w-[80%] px-3 py-1.5 rounded-2xl text-[10px] font-semibold leading-tight ${align === "right" ? "self-end rounded-br-sm" : "self-start rounded-bl-sm"}`}
    style={{ background: color, color: textColor }}
  >
    {text}
  </motion.div>
);

/* ─────────────────────────────────────────────
   POSTER 1 — Create a Room
───────────────────────────────────────────── */
function PosterCreateRoom({ onCreateRoom }: { onCreateRoom: () => void }) {
  const [step, setStep] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "0px 0px -60px 0px" });

  useEffect(() => {
    if (!inView) return;
    setStep(0);
    const t1 = setTimeout(() => setStep(1), 600);
    const t2 = setTimeout(() => setStep(2), 1400);
    const t3 = setTimeout(() => setStep(3), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [inView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, type: "spring" }}
      className="relative rounded-[2rem] overflow-hidden border border-white/10 p-5"
      style={{ background: "linear-gradient(135deg, #0d0d1a 0%, #130d22 100%)" }}
    >
      {/* background glow blob */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full blur-3xl opacity-30" style={{ background: "#fac9f6" }} />

      <div className="relative z-10">
        {/* label */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-sm" style={{ background: "rgba(250,201,246,0.15)" }}>🏠</div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#fac9f6]">Step 1</span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">— Create a Room</span>
        </div>

        {/* animated mockup */}
        <div className="rounded-xl p-3 mb-4 border border-white/5" style={{ background: "rgba(255,255,255,0.04)" }}>
          {/* Top bar mockup */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-16 h-5 rounded-lg" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="flex gap-1 ml-auto">
              <div className="w-2 h-2 rounded-full bg-red-500/60" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
              <div className="w-2 h-2 rounded-full bg-green-500/60" />
            </div>
          </div>

          {/* input row */}
          <div className="flex items-center gap-2 p-2 rounded-xl border border-white/10 mb-2" style={{ background: "rgba(0,0,0,0.3)" }}>
            <span className="text-[10px] text-white/30 font-mono flex-1">
              {step >= 1 ? (
                <>Library Gossips{step < 2 ? <Cursor /> : null}</>
              ) : (
                <span className="text-white/15">Room name...</span>
              )}
            </span>
          </div>

          {/* color row */}
          {step >= 2 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }} className="flex gap-2 flex-wrap">
              {["#e879f9", "#22c55e", "#3b82f6", "#f59e0b", "#ef4444"].map((c, i) => (
                <motion.div key={c} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.07 }}
                  className="w-5 h-5 rounded-full border-2" style={{ background: c, borderColor: c === "#e879f9" ? "white" : "transparent" }} />
              ))}
            </motion.div>
          )}
        </div>

        {/* create button animation */}
        {step >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full py-2 rounded-xl text-center text-[11px] font-black uppercase tracking-widest text-black"
            style={{ background: "white" }}
          >
            Create ✓
          </motion.div>
        )}

        {/* description */}
        <p className="text-[10px] text-white/40 mt-3 leading-relaxed font-medium">
          Go to <span className="text-[#fac9f6] font-black">Saved</span> tab → tap the <span className="text-[#fac9f6] font-black">+</span> button → give your room a name and a color. Share the link with your friends.
        </p>

        {/* CTA */}
        <button
          onClick={onCreateRoom}
          className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#fac9f6] active:scale-95 transition-transform"
        >
          <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>→</motion.span>
          Create your first room
        </button>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   POSTER 2 — Drop a message
───────────────────────────────────────────── */
function PosterDropMessage() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "0px 0px -60px 0px" });
  const [visible, setVisible] = useState<number[]>([]);

  const messages = [
    { text: "I actually hate the canteen food 💀", align: "right" as const, color: "rgba(250,201,246,0.18)", delay: 0.2 },
    { text: "The wifi at block C is dead fr", align: "left" as const, color: "rgba(255,255,255,0.07)", delay: 0.55 },
    { text: "who else thinks the prof is goated?", align: "right" as const, color: "rgba(250,201,246,0.18)", delay: 0.9 },
  ];

  useEffect(() => {
    if (!inView) { setVisible([]); return; }
    messages.forEach((_, i) => {
      setTimeout(() => setVisible(v => [...v, i]), 400 + i * 700);
    });
  }, [inView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, type: "spring", delay: 0.1 }}
      className="relative rounded-[2rem] overflow-hidden border border-white/10 p-5"
      style={{ background: "linear-gradient(135deg, #0d1a0f 0%, #0a1510 100%)" }}
    >
      <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full blur-3xl opacity-25" style={{ background: "#4ade80" }} />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-sm" style={{ background: "rgba(74,222,128,0.15)" }}>💬</div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#4ade80]">Step 2</span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">— Drop a message</span>
        </div>

        {/* Chat mockup */}
        <div className="rounded-xl p-3 mb-3 border border-white/5 flex flex-col gap-2" style={{ background: "rgba(255,255,255,0.03)", minHeight: 96 }}>
          <AnimatePresence>
            {messages.map((m, i) =>
              visible.includes(i) ? (
                <Bubble key={i} text={m.text} align={m.align} color={m.color} />
              ) : null
            )}
          </AnimatePresence>
          {/* typing indicator */}
          {visible.length < messages.length && visible.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 items-center px-1">
              {[0, 0.2, 0.4].map((d, i) => <Dot key={i} color="#4ade80" size={5} delay={d} />)}
            </motion.div>
          )}
        </div>

        <p className="text-[10px] text-white/40 leading-relaxed font-medium">
          Open any room → type your honest thoughts anonymously. Pick a <span className="text-[#4ade80] font-black">display name</span> or stay fully ghost. No accounts needed.
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   POSTER 3 — Reply to drops
───────────────────────────────────────────── */
function PosterReplies() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "0px 0px -60px 0px" });
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!inView) { setPhase(0); return; }
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [inView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, type: "spring", delay: 0.05 }}
      className="relative rounded-[2rem] overflow-hidden border border-white/10 p-5"
      style={{ background: "linear-gradient(135deg, #0d0f1a 0%, #0a0e20 100%)" }}
    >
      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl opacity-25" style={{ background: "#818cf8" }} />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-sm" style={{ background: "rgba(129,140,248,0.15)" }}>↩️</div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#818cf8]">Step 3</span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">— Reply & React</span>
        </div>

        <div className="rounded-xl p-3 mb-3 border border-white/5 flex flex-col gap-2" style={{ background: "rgba(255,255,255,0.03)" }}>
          {/* Original drop */}
          {phase >= 1 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl rounded-tl-sm px-3 py-2" style={{ background: "rgba(255,255,255,0.07)" }}>
              <p className="text-[10px] text-white/70 font-medium">The semester timetable is pure chaos 😭</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[9px] text-white/30">👍 12</span>
                <span className="text-[9px] text-white/30">👎 2</span>
                <motion.span animate={{ color: phase >= 2 ? "#818cf8" : "rgba(255,255,255,0.3)" }} className="text-[9px] font-black uppercase">Reply</motion.span>
              </div>
            </motion.div>
          )}

          {/* Reply */}
          {phase >= 2 && (
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="ml-4 rounded-2xl rounded-tr-sm px-3 py-1.5" style={{ background: "rgba(129,140,248,0.15)" }}>
              <p className="text-[10px] text-[#818cf8] font-semibold">facts bro they overlap 3 subjects 💀</p>
            </motion.div>
          )}

          {/* Another reply */}
          {phase >= 3 && (
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="ml-4 rounded-2xl rounded-tr-sm px-3 py-1.5" style={{ background: "rgba(129,140,248,0.12)" }}>
              <p className="text-[10px] text-[#a5b4fc] font-semibold">raise it to the HOD anonymously 👀</p>
            </motion.div>
          )}
        </div>

        <p className="text-[10px] text-white/40 leading-relaxed font-medium">
          Long-press or tap <span className="text-[#818cf8] font-black">Reply</span> on any drop to thread a response. Like or dislike — all anonymous.
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   POSTER 4 — AI Moderation
───────────────────────────────────────────── */
function PosterModeration() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "0px 0px -60px 0px" });
  const [phase, setPhase] = useState(0);

  const badWords = ["h@te", "f***", "k!ll"];
  const goodWords = ["rant", "opinion", "honest take"];

  useEffect(() => {
    if (!inView) { setPhase(0); return; }
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1300);
    const t3 = setTimeout(() => setPhase(3), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [inView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, type: "spring", delay: 0.1 }}
      className="relative rounded-[2rem] overflow-hidden border border-white/10 p-5 col-span-2"
      style={{ background: "linear-gradient(135deg, #1a0d0d 0%, #1a0a0a 100%)" }}
    >
      {/* Animated scan line */}
      <motion.div
        className="absolute inset-x-0 h-px opacity-40"
        style={{ background: "linear-gradient(90deg, transparent, #f87171, transparent)" }}
        animate={{ top: ["10%", "90%", "10%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute -bottom-6 right-0 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "#f87171" }} />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-sm" style={{ background: "rgba(248,113,113,0.15)" }}>🛡️</div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#f87171]">Always On</span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">— AI Moderation</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Blocked column */}
          <div className="rounded-xl p-3 border border-red-500/20" style={{ background: "rgba(248,113,113,0.05)" }}>
            <p className="text-[9px] font-black uppercase text-red-400/70 mb-2 tracking-widest">Blocked ✗</p>
            <div className="flex flex-col gap-1.5">
              {badWords.map((w, i) => (
                phase >= 1 ? (
                  <motion.div key={w} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: "rgba(248,113,113,0.12)" }}>
                    <span className="text-[9px] font-mono text-red-400 line-through">{w}</span>
                    <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }} className="text-[9px]">🚫</motion.span>
                  </motion.div>
                ) : (
                  <div key={w} className="h-5 rounded-lg animate-pulse" style={{ background: "rgba(248,113,113,0.06)" }} />
                )
              ))}
            </div>
          </div>

          {/* Allowed column */}
          <div className="rounded-xl p-3 border border-green-500/20" style={{ background: "rgba(74,222,128,0.05)" }}>
            <p className="text-[9px] font-black uppercase text-green-400/70 mb-2 tracking-widest">Allowed ✓</p>
            <div className="flex flex-col gap-1.5">
              {goodWords.map((w, i) => (
                phase >= 2 ? (
                  <motion.div key={w} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: "rgba(74,222,128,0.1)" }}>
                    <span className="text-[9px] font-medium text-green-400">{w}</span>
                    <span className="text-[9px] ml-auto">✓</span>
                  </motion.div>
                ) : (
                  <div key={w} className="h-5 rounded-lg animate-pulse" style={{ background: "rgba(74,222,128,0.05)" }} />
                )
              ))}
            </div>
          </div>
        </div>

        {/* Status badge */}
        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-red-500/20"
            style={{ background: "rgba(248,113,113,0.06)" }}
          >
            <motion.div className="w-2 h-2 rounded-full bg-red-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
            <p className="text-[9px] text-white/50 font-medium flex-1">Real-time scan before every post. Toxic content never reaches the feed.</p>
          </motion.div>
        )}

        <p className="text-[10px] text-white/40 mt-3 leading-relaxed font-medium">
          Our engine checks every drop and reply against <span className="text-[#f87171] font-black">400+ abuse patterns</span> including leetspeak and phonetic variants — so no one ruins the vibe.
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   SECTION DIVIDER
───────────────────────────────────────────── */
function SectionLabel({ text }: { text: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -30px 0px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, x: -12 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.4 }}
      className="flex items-center gap-3 px-6 mb-4 mt-8">
      <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(250,201,246,0.3), transparent)" }} />
      <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#fac9f6]/60">{text}</span>
      <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(250,201,246,0.3))" }} />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   ROOT EXPORT
───────────────────────────────────────────── */
export default function OnboardingPosters({ onCreateRoom }: { onCreateRoom: () => void }) {
  return (
    <div className="w-full">
      <SectionLabel text="How it works" />

      {/* 2-col grid for first 3 posters */}
      <div className="px-6 grid grid-cols-2 gap-4">
        <PosterCreateRoom onCreateRoom={onCreateRoom} />
        <PosterDropMessage />
        <PosterReplies />
        {/* Moderation poster spans both cols */}
        <PosterModeration />
      </div>

      {/* Separator before rooms */}
      <SectionLabel text="All Rooms" />
    </div>
  );
}
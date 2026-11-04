"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/** Opening wordmark. Plays once when the site is opened, never again. */
export default function IntroScreen({ onFinish }: { onFinish: () => void }) {
  const [out, setOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setOut(true), 1750);
    const t2 = setTimeout(onFinish, 2450);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onFinish]);

  return (
    <motion.div
      className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden"
      style={{ background: '#fff', pointerEvents: out ? 'none' : 'all' }}
      animate={{ opacity: out ? 0 : 1 }}
      transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* a single soft light, drifting */}
      <motion.div
        aria-hidden
        className="absolute rounded-full"
        style={{ width: '70vmax', height: '70vmax', background: 'radial-gradient(circle, rgba(0,0,0,0.05), transparent 62%)', filter: 'blur(30px)' }}
        initial={{ x: '-14vmax', y: '-6vmax', opacity: 0 }}
        animate={{ x: '12vmax', y: '6vmax', opacity: 1 }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.h1
        className="relative select-none font-bold"
        style={{ fontSize: 'clamp(34px, 9vw, 44px)', color: 'var(--ink)' }}
        initial={{ opacity: 0, filter: 'blur(16px)', scale: 1.06, letterSpacing: '0.16em' }}
        animate={{ opacity: 1, filter: 'blur(0px)', scale: 1, letterSpacing: '-0.045em' }}
        transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
      >
        B<span className="mirror">L</span>ACK BOX
      </motion.h1>
    </motion.div>
  );
}

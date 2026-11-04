"use client";
import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/** Tiny glass toast. `const [toast, show] = useToast()` then render {toast}. */
export function useToast(): [React.ReactNode, (msg: string) => void] {
  const [msg, setMsg] = useState<string | null>(null);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((m: string) => {
    setMsg(m);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setMsg(null), 2400);
  }, []);

  const node = (
    <div className="fixed inset-x-0 z-[200] flex justify-center pointer-events-none" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 14px)' }}>
      <AnimatePresence>
        {msg && (
          <motion.div
            key={msg}
            initial={{ opacity: 0, y: -18, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="glass glass-strong rounded-full px-5 py-2.5 text-[15px] font-semibold"
            style={{ letterSpacing: '-0.01em' }}
          >
            {msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  return [node, show];
}

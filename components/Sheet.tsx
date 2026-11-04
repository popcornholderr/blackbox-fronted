"use client";
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

/** iOS-style bottom sheet — glass body, grabber, drag to dismiss. */
export default function Sheet({
  open, onClose, title, children,
}: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{ background: 'rgba(20,20,24,0.14)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, i) => { if (i.offset.y > 110 || i.velocity.y > 600) onClose(); }}
            className="glass glass-strong w-full max-w-[32rem] max-h-[88vh] overflow-y-auto rounded-t-[36px] px-5 pt-3"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}
          >
            <div className="w-9 h-[5px] rounded-full mx-auto mb-3" style={{ background: 'rgba(60,60,67,0.3)' }} />
            <div className="relative flex items-center justify-center h-9 mb-4">
              {title && <h2 className="text-[18.5px] font-semibold" style={{ letterSpacing: '-0.02em' }}>{title}</h2>}
              <button
                type="button" onClick={onClose} aria-label="Close"
                className="press absolute right-0 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(120,120,128,0.16)' }}
              >
                <X size={15} strokeWidth={2.6} style={{ color: 'var(--ink-2)' }} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Inset text field used inside sheets / forms. */
export const fieldClass =
  'w-full rounded-[18px] px-4 py-3.5 text-[17.5px] font-medium outline-none bg-[rgba(120,120,128,0.1)] placeholder:text-[color:var(--ink-3)] focus:bg-[rgba(120,120,128,0.14)] transition-colors';

export function PrimaryButton({
  children, onClick, disabled, className = '',
}: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled}
      className={`press w-full h-[58px] rounded-full text-[18.5px] font-semibold text-white disabled:opacity-30 disabled:active:scale-100 ${className}`}
      style={{
        background: 'linear-gradient(180deg, #2a2a2e 0%, #0b0b0d 100%)',
        boxShadow: 'inset 0 1px 0.5px rgba(255,255,255,0.22), 0 14px 28px -12px rgba(0,0,0,0.5)',
        letterSpacing: '-0.015em',
      }}
    >
      {children}
    </button>
  );
}

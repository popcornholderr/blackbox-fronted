"use client";
import { motion } from 'framer-motion';
import { Lock, ChevronRight, Inbox } from 'lucide-react';
import { PageTitle } from './shared';
import { timeLeft, type JoinRecord } from '@/lib/rooms';

const AVATARS = 19;

export default function ProfileTab({
  avatarIndex, onAvatar, inbox, onOpenRoom,
}: {
  avatarIndex: number; onAvatar: (i: number) => void;
  inbox: JoinRecord[]; onOpenRoom: (r: JoinRecord) => void;
}) {
  return (
    <div>
      <PageTitle>Profile</PageTitle>

      {/* avatar */}
      <div className="flex flex-col items-center mt-3">
        <motion.div
          key={avatarIndex}
          initial={{ scale: 0.86, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          className="glass rounded-full p-[7px]"
          style={{ width: 132, height: 132 }}
        >
          <img src={`/avatars/${avatarIndex}.png`} alt="Your bitmoji" className="w-full h-full rounded-full object-cover bg-white" />
        </motion.div>
      </div>

      {/* picker */}
      <div className="mt-7 flex gap-3 overflow-x-auto snap-x no-scrollbar px-6 py-2">
        {[...Array(AVATARS)].map((_, i) => {
          const on = i === avatarIndex;
          return (
            <button
              key={i}
              type="button"
              aria-label={`Bitmoji ${i + 1}`}
              aria-pressed={on}
              onClick={() => onAvatar(i)}
              className="press snap-center shrink-0 rounded-full p-[3px] transition-[box-shadow,transform] duration-300"
              style={{
                width: 60, height: 60,
                boxShadow: on ? '0 0 0 2px var(--ink)' : '0 0 0 0.5px rgba(0,0,0,0.1)',
                transform: on ? 'scale(1.06)' : undefined,
                background: '#fff',
              }}
            >
              <img src={`/avatars/${i}.png`} alt="" className="w-full h-full rounded-full object-cover" style={{ opacity: on ? 1 : 0.85 }} />
            </button>
          );
        })}
      </div>

      {/* inbox */}
      <section className="px-5 mt-9">
        <div className="flex items-baseline justify-between px-1 mb-2.5">
          <h2 className="text-[24px] font-bold" style={{ letterSpacing: '-0.035em' }}>Inbox</h2>
          {inbox.length > 0 && <span className="text-[15px] font-semibold" style={{ color: 'var(--ink-2)' }}>{inbox.length}</span>}
        </div>

        {inbox.length === 0 ? (
          <div className="group-card flex flex-col items-center gap-2.5 py-9" style={{ color: 'var(--ink-3)' }}>
            <Inbox size={26} strokeWidth={1.6} />
            <span className="text-[16px] font-semibold" style={{ letterSpacing: '-0.015em' }}>All clear</span>
          </div>
        ) : (
          <div className="group-card">
            {inbox.map((r, i) => (
              <motion.button
                key={r.roomId}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => onOpenRoom(r)}
                className="group-row w-full flex items-center gap-3.5 px-4 py-3 text-left active:bg-black/[0.04] transition-colors"
              >
                <span
                  className="tile w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0"
                  style={{ ['--c' as any]: r.color }}
                >
                  <span className="blob a" /><span className="blob b" />
                  <Lock size={15} strokeWidth={2.2} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[18px] font-semibold truncate" style={{ letterSpacing: '-0.02em' }}>{r.title}</span>
                  <span className="block text-[14px] mt-0.5" style={{ color: 'var(--ink-2)' }}>Approved · {timeLeft(r)}</span>
                </span>
                <ChevronRight size={18} strokeWidth={2.2} style={{ color: 'var(--ink-3)' }} />
              </motion.button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

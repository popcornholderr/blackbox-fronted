"use client";
import { motion } from 'framer-motion';
import RoomTile from '@/components/RoomTile';

export function PageTitle({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <header className="px-6 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 34px)' }}>
      <h1 className="text-[36.5px] leading-none font-bold" style={{ letterSpacing: '-0.045em' }}>{children}</h1>
      {sub}
    </header>
  );
}

export function EmptyState({ icon, title, action }: { icon: React.ReactNode; title: string; action?: { label: string; onClick: () => void } }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center gap-3.5 pt-16"
    >
      <div className="glass w-[73px] h-[73px] rounded-full flex items-center justify-center" style={{ color: 'var(--ink-2)' }}>
        {icon}
      </div>
      <p className="text-[17.5px] font-semibold" style={{ letterSpacing: '-0.02em', color: 'var(--ink-2)' }}>{title}</p>
      {action && (
        <button onClick={action.onClick} className="press text-[16px] font-semibold px-4 py-2 rounded-full" style={{ background: 'var(--fill)' }}>
          {action.label}
        </button>
      )}
    </motion.div>
  );
}

export function RoomGrid({
  rooms, loaded, error, savedIds, onSave, onOpen, onRetry, empty, newFlags,
}: {
  rooms: any[]; loaded: boolean; error: boolean; savedIds: string[];
  onSave: (id: string) => void; onOpen: (id: string) => void; onRetry: () => void;
  empty: React.ReactNode; newFlags?: (room: any) => boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3.5 px-4 pt-6">
      {!loaded && !error && [...Array(6)].map((_, i) => (
        <div key={i} suppressHydrationWarning className="skeleton aspect-square rounded-[34px]" style={{ animationDelay: `${i * 90}ms` }} />
      ))}

      {error && rooms.length === 0 && (
        <EmptyState
          icon={<span className="text-[24px] font-semibold leading-none">!</span>}
          title="Can't reach the server"
          action={{ label: 'Try again', onClick: onRetry }}
        />
      )}

      {loaded && rooms.map((room, i) => (
        <motion.div
          key={room._id}
          initial={i < 8 ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: Math.min(i, 8) * 0.025, ease: [0.22, 1, 0.36, 1] }}
        >
          <RoomTile
            room={room}
            isSaved={savedIds.includes(room._id)}
            hasNew={newFlags?.(room)}
            onSave={() => onSave(room._id)}
            onOpen={() => onOpen(room._id)}
          />
        </motion.div>
      ))}

      {loaded && !error && rooms.length === 0 && empty}
    </div>
  );
}

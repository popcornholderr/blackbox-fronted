"use client";
import type { CSSProperties, ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';

/** Soft wash of the room's colour at the top of the page. Everything else stays white. */
export function RoomBackdrop({ color }: { color?: string }) {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-[1] pointer-events-none"
      style={{
        ['--c' as any]: color || '#c9c9d1',
        background:
          'radial-gradient(80% 38% at 50% -6%, color-mix(in srgb, var(--c) 26%, white), transparent 70%), radial-gradient(60% 30% at 100% 100%, color-mix(in srgb, var(--c) 12%, white), transparent 70%)',
      } as CSSProperties}
    />
  );
}

export function GlassIconButton({
  children, onClick, label,
}: { children: ReactNode; onClick?: () => void; label: string }) {
  return (
    <button
      type="button" onClick={onClick} aria-label={label}
      className="glass press w-12 h-12 rounded-full flex items-center justify-center shrink-0"
    >
      {children}
    </button>
  );
}

/** Floating nav: glass back button, centred title, optional right-hand actions. */
export function RoomHeader({
  title, lock, onBack, right,
}: { title: string; lock?: boolean; onBack: () => void; right?: ReactNode }) {
  return (
    <>
      <div className="top-fade" aria-hidden style={{ height: 'calc(env(safe-area-inset-top, 0px) + 84px)' }} />
      <header
        className="fixed inset-x-0 top-0 z-[70] flex justify-center pointer-events-none"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      >
        <div className="w-full max-w-[32rem] px-4 flex items-center gap-3 pointer-events-auto">
          <GlassIconButton onClick={onBack} label="Back"><ChevronLeft size={24} strokeWidth={2.4} className="-ml-0.5" /></GlassIconButton>
          <h1
            className="flex-1 min-w-0 text-center text-[18.5px] font-semibold flex items-center justify-center gap-1.5"
            style={{ letterSpacing: '-0.02em' }}
          >
            {lock && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="4" y="11" width="16" height="10" rx="3" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>}
            <span className="truncate">{title}</span>
          </h1>
          <div className="flex items-center gap-2 min-w-[48px] justify-end">{right}</div>
        </div>
      </header>
    </>
  );
}

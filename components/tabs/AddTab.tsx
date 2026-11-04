"use client";
import { useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, RefreshCw } from 'lucide-react';
import { PageTitle } from './shared';
import { PrimaryButton, fieldClass } from '@/components/Sheet';
import { generateUniqueColor } from '@/lib/rooms';

export type NewRoom = { title: string; color: string; isAdult: boolean; isPrivate: boolean; adminCode: string };

export function freshRoom(): NewRoom {
  return { title: '', color: generateUniqueColor(), isAdult: false, isPrivate: false, adminCode: '' };
}

/* iOS segmented control with a sliding glass thumb */
function Segmented({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const opts = [{ v: false, label: 'Public' }, { v: true, label: 'Private' }];
  return (
    <div className="relative flex p-[3px] rounded-full" style={{ background: 'rgba(120,120,128,0.14)' }} role="tablist">
      {opts.map((o) => {
        const on = value === o.v;
        return (
          <button
            key={o.label} type="button" role="tab" aria-selected={on}
            onClick={() => onChange(o.v)}
            className="relative flex-1 h-[41px] text-[16px] font-semibold rounded-full"
            style={{ letterSpacing: '-0.015em', color: on ? 'var(--ink)' : 'var(--ink-2)', transition: 'color .25s' }}
          >
            {on && (
              <motion.span
                layoutId="seg-thumb"
                className="absolute inset-0 rounded-full"
                style={{ background: '#fff', boxShadow: '0 1px 1px rgba(0,0,0,0.04), 0 3px 10px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.04)' }}
                transition={{ type: 'spring', stiffness: 460, damping: 34 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function AddTab({
  value, onChange, onCreate, busy,
}: {
  value: NewRoom; onChange: (v: NewRoom) => void; onCreate: () => void; busy: boolean;
}) {
  const [spin, setSpin] = useState(0);
  const ready = value.title.trim().length > 0 && (!value.isPrivate || value.adminCode.trim().length > 0);

  return (
    <div>
      <PageTitle>New Room</PageTitle>

      <div className="px-5 flex flex-col gap-6">
        {/* live preview — tap to shuffle the colour */}
        <div className="flex justify-center pt-1">
          <button
            type="button"
            aria-label="Shuffle colour"
            onClick={() => { onChange({ ...value, color: generateUniqueColor() }); setSpin((s) => s + 1); }}
            className="tile aspect-square rounded-[37px] w-[186px] text-left"
            style={{ ['--c' as any]: value.color } as CSSProperties}
          >
            <span className="blob a" /><span className="blob b" />
            {value.isPrivate && (
              <span className="glass absolute left-4 top-4 w-[30px] h-[30px] rounded-full flex items-center justify-center">
                <Lock size={12.5} strokeWidth={2.3} />
              </span>
            )}
            <motion.span
              className="absolute right-4 top-4"
              animate={{ rotate: spin * 180 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              style={{ color: 'var(--ink-2)' }}
            >
              <RefreshCw size={16} strokeWidth={2.1} />
            </motion.span>
            <span
              className="absolute inset-x-0 bottom-0 px-5 pb-5 text-[22.5px] leading-[1.1] font-semibold line-clamp-2 break-words"
              style={{ letterSpacing: '-0.03em', color: value.title ? 'var(--ink)' : 'var(--ink-3)' }}
            >
              {value.title || 'Untitled'}
            </span>
          </button>
        </div>

        <input
          className={fieldClass}
          style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}
          placeholder="Room name"
          maxLength={32}
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
        />

        <Segmented value={value.isPrivate} onChange={(v) => onChange({ ...value, isPrivate: v, adminCode: '' })} />

        <div className="group-card">
          <div className="group-row flex items-center justify-between px-4 h-[60px]">
            <span className="text-[18.5px] font-medium" style={{ letterSpacing: '-0.02em' }}>18+</span>
            <button
              type="button" role="switch" aria-checked={value.isAdult} aria-label="18+"
              className="ios-switch" onClick={() => onChange({ ...value, isAdult: !value.isAdult })}
            ><i /></button>
          </div>
          <AnimatePresence initial={false}>
            {value.isPrivate && (
              <motion.div
                key="code"
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="group-row overflow-hidden"
              >
                <div className="flex items-center gap-3 px-4 h-[60px]">
                  <Lock size={17} strokeWidth={2} style={{ color: 'var(--ink-2)' }} />
                  <input
                    type="text" autoComplete="off" autoCapitalize="off" spellCheck={false}
                    placeholder="Admin code"
                    value={value.adminCode}
                    onChange={(e) => onChange({ ...value, adminCode: e.target.value })}
                    className="flex-1 bg-transparent outline-none text-[18.5px] font-medium placeholder:text-[color:var(--ink-3)]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <PrimaryButton onClick={onCreate} disabled={!ready || busy}>
          {busy ? 'Creating' : 'Create'}
        </PrimaryButton>
      </div>
    </div>
  );
}

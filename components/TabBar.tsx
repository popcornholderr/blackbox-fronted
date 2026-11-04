"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { House, Plus, Bookmark, User } from 'lucide-react';

export type TabKey = 'home' | 'add' | 'saved' | 'profile';

const TABS: { key: TabKey; label: string; Icon: typeof House }[] = [
  { key: 'home', label: 'Home', Icon: House },
  { key: 'add', label: 'Add', Icon: Plus },
  { key: 'saved', label: 'Saved', Icon: Bookmark },
  { key: 'profile', label: 'Profile', Icon: User },
];

const TAB_W = 64;
const PAD = 4;
const BAR_H = 52;
const BAR_W = TAB_W * TABS.length + PAD * 2;
const THUMB_W = TAB_W;
const THUMB_H = BAR_H - PAD * 2;

export default function TabBar({
  active,
  onChange,
  badge,
}: {
  active: TabKey;
  onChange: (k: TabKey) => void;
  badge?: TabKey | null;
}) {
  const [pressed, setPressed] = useState(false);
  const index = TABS.findIndex((t) => t.key === active);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-[80] flex justify-center pointer-events-none"
      style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 14px) + 14px)' }}
    >
      <div className="relative pointer-events-auto" style={{ width: BAR_W, height: BAR_H }}>
        {/* body */}
        <div
          className="glass glass-bar absolute inset-0"
          style={{ borderRadius: BAR_H / 2 }}
        />

        {/* sliding lens */}
        <motion.div
          aria-hidden
          className="absolute"
          style={{
            left: PAD,
            top: PAD,
            width: THUMB_W,
            height: THUMB_H,
            borderRadius: THUMB_H / 2,
            background: pressed
              ? 'linear-gradient(160deg, rgba(255,255,255,0.55), rgba(255,255,255,0.12))'
              : 'linear-gradient(160deg, rgba(120,120,128,0.16), rgba(120,120,128,0.1))',
            boxShadow: pressed
              ? '0 0 0 0.5px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,1), inset 0 -1px 2px rgba(255,255,255,0.6), 0 10px 22px -8px rgba(0,0,0,0.25)'
              : 'inset 0 1px 0.5px rgba(255,255,255,0.8), inset 0 0 0 0.5px rgba(255,255,255,0.4)',
          }}
          animate={{ x: index * TAB_W, scaleX: pressed ? 1.16 : 1, scaleY: pressed ? 1.12 : 1 }}
          transition={{
            x: { type: 'spring', stiffness: 420, damping: 34, mass: 0.9 },
            scaleX: { type: 'spring', stiffness: 380, damping: 22 },
            scaleY: { type: 'spring', stiffness: 380, damping: 22 },
          }}
        />

        {/* tabs */}
        <div className="absolute inset-0 flex" style={{ padding: PAD }}>
          {TABS.map(({ key, label, Icon }) => {
            const on = key === active;
            return (
              <button
                key={key}
                type="button"
                aria-label={label}
                aria-current={on ? 'page' : undefined}
                onClick={() => onChange(key)}
                onPointerDown={() => setPressed(true)}
                onPointerUp={() => setPressed(false)}
                onPointerLeave={() => setPressed(false)}
                onPointerCancel={() => setPressed(false)}
                className="relative flex items-center justify-center outline-none"
                style={{ width: TAB_W, height: THUMB_H, color: on ? 'var(--ink)' : 'rgba(60,60,67,0.55)', transition: 'color .3s var(--ease)' }}
              >
                <span className="relative">
                  <Icon size={23} strokeWidth={on ? 2.2 : 1.8} />
                  {badge === key && !on && (
                    <span
                      className="absolute -right-1 -top-0.5 w-[7px] h-[7px] rounded-full"
                      style={{ background: 'var(--ink)', boxShadow: '0 0 0 1.5px #fff' }}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

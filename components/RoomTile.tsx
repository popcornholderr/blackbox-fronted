"use client";
import { useState, useCallback, memo } from 'react';
import { Bookmark, Share2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

const getContrastColor = (hexcolor: string) => {
  if (!hexcolor) return "#ffffff";
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
};

/* ── PRIVATE: Glassy lock with keyhole ── */
function VisibilityBadge({ isPrivate }: { isPrivate: boolean }) {
  if (isPrivate) {
    return (
      <div
        className="flex items-center justify-center w-7 h-7 rounded-xl"
        style={{
          background: 'rgba(8,12,28,0.72)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(96,165,250,0.45)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)',
        }}
      >
        {/* Lock body */}
        <svg width="13" height="14" viewBox="0 0 13 14" fill="none">
          <rect x="1.5" y="6" width="10" height="7" rx="2.2" fill="rgba(96,165,250,0.18)" stroke="#60a5fa" strokeWidth="1.15"/>
          <path d="M3.8 6V4.5C3.8 2.84 9.2 2.84 9.2 4.5V6" stroke="#60a5fa" strokeWidth="1.15" strokeLinecap="round"/>
          <circle cx="6.5" cy="9.4" r="1.1" fill="#93c5fd"/>
          <rect x="5.9" y="9.6" width="1.2" height="1.8" rx="0.6" fill="#93c5fd"/>
        </svg>
      </div>
    );
  }
  /* PUBLIC: Glassy globe with latitude/longitude lines */
  return (
    <div
      className="flex items-center justify-center w-7 h-7 rounded-xl"
      style={{
        background: 'rgba(4,8,20,0.72)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(250,201,246,0.38)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.4" stroke="#fac9f6" strokeWidth="1.1" fill="rgba(250,201,246,0.06)"/>
        {/* equator */}
        <path d="M1.6 7 Q4 5.2 7 7 Q10 8.8 12.4 7" stroke="#fac9f6" strokeWidth="0.8" fill="none"/>
        {/* meridian */}
        <path d="M7 1.6 Q5.2 4 7 7 Q8.8 10 7 12.4" stroke="#fac9f6" strokeWidth="0.8" fill="none"/>
        {/* top shine */}
        <path d="M5 3.2 Q6 2.6 8 3" stroke="rgba(250,201,246,0.5)" strokeWidth="0.6" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

/* ── SAFE: Shield with checkmark ── */
/* ── ADULT: Flame icon ── */
function ContentBadge({ isAdult }: { isAdult: boolean }) {
  if (isAdult) {
    return (
      <div
        className="flex items-center justify-center w-7 h-7 rounded-xl"
        style={{
          background: 'rgba(24,4,4,0.72)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(239,68,68,0.5)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Flame */}
        <svg width="11" height="14" viewBox="0 0 11 14" fill="none">
          <path
            d="M5.5 13C2.5 13 0.8 10.8 0.8 8.6C0.8 6.8 2 5.4 2.8 4.5C2.9 6 3.8 6.8 4.2 7C4 5.2 4.8 3 5.5 1.2C6.8 3 7.2 4.6 7 6C7.6 5.4 8.2 4.2 8.4 3.2C9.4 4.2 10.2 5.8 10.2 8C10.2 10.8 8.2 13 5.5 13Z"
            fill="rgba(239,68,68,0.25)"
            stroke="#f87171"
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
          <path
            d="M5.5 11.5C4 11.5 3.2 10.3 3.4 9C3.8 9.6 4.4 9.8 5.5 9.6C5.2 10.4 5.6 11 5.5 11.5Z"
            fill="#fca5a5"
          />
        </svg>
      </div>
    );
  }
  /* SAFE: shield + check */
  return (
    <div
      className="flex items-center justify-center w-7 h-7 rounded-xl"
      style={{
        background: 'rgba(4,16,6,0.72)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(74,222,128,0.42)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
        <path
          d="M6 1L11 3V7.5C11 10.2 8.8 12.5 6 13.2C3.2 12.5 1 10.2 1 7.5V3L6 1Z"
          fill="rgba(74,222,128,0.14)"
          stroke="#4ade80"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* checkmark */}
        <path d="M3.8 7L5.2 8.5L8.2 5.5" stroke="#86efac" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        {/* shine */}
        <path d="M4 2.8 Q5 2.3 7 2.6" stroke="rgba(134,239,172,0.4)" strokeWidth="0.6" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

// ── Use memo to prevent re-renders when parent re-renders ──
const RoomTile = memo(function RoomTile({ room, isSaved, onSave, onOpen }: any) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const theme = room.color || "#000000";
  const textColor = getContrastColor(theme);
  const subTextColor = textColor === "#000000" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)";
  const displaySavedCount = Math.max(0, room.savedCount || 0);

  const handleTileClick = useCallback(() => {
    onOpen?.();
    router.push(`/room/${room.slug}`);
  }, [room.slug, onOpen, router]);

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSave();
  }, [onSave]);

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/room/${room.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [room.slug]);

  return (
    <div
      onClick={handleTileClick}
      className="aspect-square rounded-[2.2rem] flex flex-col justify-between shadow-xl relative overflow-hidden border border-black/5 cursor-pointer"
      style={{
        backgroundColor: theme,
        transform: 'translateZ(0)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between p-3 z-10">
        <button
          onClick={handleSave}
          className="p-2 rounded-2xl backdrop-blur-md border transition-all z-10 active:scale-90"
          style={{
            backgroundColor: textColor === "#000000" ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.13)",
            borderColor: textColor === "#000000" ? "rgba(0,0,0,0.13)" : "rgba(255,255,255,0.18)",
          }}
        >
          <Bookmark
            size={14}
            fill={isSaved ? (textColor === "#000000" ? "black" : "white") : "none"}
            color={textColor === "#000000" ? "black" : "white"}
            strokeWidth={2.5}
          />
        </button>

        {/* Icon-only badge stack — no text */}
        <div className="z-10 flex flex-col items-end gap-1">
          <VisibilityBadge isPrivate={room.isPrivate} />
          <ContentBadge isAdult={room.isAdult} />
        </div>
      </div>

      {/* Bottom */}
      <div className="z-10 px-4 pb-4">
        <h3
          className="font-black text-[16px] leading-tight uppercase tracking-tight"
          style={{ color: textColor }}
        >
          {room.title}
        </h3>
        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: subTextColor }}>
            {displaySavedCount} Saved
          </p>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-[9px] transition-colors z-10"
            style={{ color: subTextColor }}
          >
            {copied ? <Check size={9} className="text-green-500" /> : <Share2 size={9} />}
            <span className="truncate max-w-[52px] uppercase font-bold">/{room.slug}</span>
          </button>
        </div>
      </div>
    </div>
  );
});

export default RoomTile;

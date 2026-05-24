"use client";
import { useState } from 'react';
import { Bookmark, Share2, Check } from 'lucide-react';
import Link from 'next/link';

const getContrastColor = (hexcolor: string) => {
  if (!hexcolor) return "#ffffff";
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
};

/* ── Visibility badge: Public or Private ── */
function VisibilityBadge({ isPrivate }: { isPrivate: boolean }) {
  if (isPrivate) {
    return (
      <div
        className="flex items-center gap-1 px-2 py-1 rounded-xl"
        style={{
          background: 'rgba(8,12,24,0.78)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(96,165,250,0.5)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <svg width="9" height="10" viewBox="0 0 9 10" fill="none">
          <rect x="1" y="4" width="7" height="5.5" rx="1.6" fill="rgba(96,165,250,0.15)" stroke="#60a5fa" strokeWidth="1.1"/>
          <path d="M2.8 4V3C2.8 1.9 6.2 1.9 6.2 3v1" stroke="#60a5fa" strokeWidth="1.1" strokeLinecap="round"/>
          <circle cx="4.5" cy="6.7" r="0.75" fill="#93c5fd"/>
        </svg>
        <span className="text-[7.5px] font-black uppercase tracking-wider" style={{ color: '#93c5fd', letterSpacing: '0.08em' }}>Private</span>
      </div>
    );
  }
  // Public
  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded-xl"
      style={{
        background: 'rgba(4,8,18,0.78)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(250,201,246,0.35)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <svg width="10" height="9" viewBox="0 0 10 9" fill="none">
        <circle cx="5" cy="4.5" r="3.6" stroke="#fac9f6" strokeWidth="1.1" fill="none"/>
        <path d="M5 0.9C5 0.9 3 2.5 3 4.5s2 3.6 2 3.6" stroke="#fac9f6" strokeWidth="0.9" fill="none"/>
        <path d="M5 0.9C5 0.9 7 2.5 7 4.5s-2 3.6-2 3.6" stroke="#fac9f6" strokeWidth="0.9" fill="none"/>
        <line x1="1.4" y1="4.5" x2="8.6" y2="4.5" stroke="#fac9f6" strokeWidth="0.9"/>
      </svg>
      <span className="text-[7.5px] font-black uppercase tracking-wider" style={{ color: '#fac9f6', letterSpacing: '0.08em' }}>Public</span>
    </div>
  );
}

/* ── Content badge: Safe or 18+ ── */
function ContentBadge({ isAdult }: { isAdult: boolean }) {
  if (isAdult) {
    return (
      <div
        className="flex items-center gap-1 px-2 py-1 rounded-xl"
        style={{
          background: 'rgba(20,4,4,0.78)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(239,68,68,0.55)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <svg width="11" height="10" viewBox="0 0 11 10" fill="none">
          <rect x="0.6" y="0.6" width="9.8" height="8.8" rx="2.4" stroke="#ef4444" strokeWidth="1" fill="rgba(239,68,68,0.12)"/>
          <text x="5.5" y="7.6" textAnchor="middle" fontSize="5.2" fontWeight="900" fill="#f87171" fontFamily="system-ui,sans-serif">18+</text>
        </svg>
      </div>
    );
  }
  // Safe
  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded-xl"
      style={{
        background: 'rgba(4,14,6,0.78)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(74,222,128,0.42)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <svg width="9" height="10" viewBox="0 0 9 10" fill="none">
        <path d="M4.5 0.8L8.2 2.4V5.6C8.2 7.7 6.6 9.1 4.5 9.7 2.4 9.1 0.8 7.7 0.8 5.6V2.4L4.5 0.8z"
          fill="rgba(74,222,128,0.13)" stroke="#4ade80" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M2.9 5l1.1 1.1 2.1-2.2" stroke="#86efac" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="text-[7.5px] font-black uppercase tracking-wider" style={{ color: '#86efac', letterSpacing: '0.08em' }}>Safe</span>
    </div>
  );
}

export default function RoomTile({ room, isSaved, onSave, onOpen }: any) {
  const [copied, setCopied] = useState(false);
  const theme = room.color || "#000000";
  const textColor = getContrastColor(theme);
  const subTextColor = textColor === "#000000" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)";
  const displaySavedCount = Math.max(0, room.savedCount || 0);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/room/${room.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="aspect-square rounded-[2.2rem] flex flex-col justify-between shadow-xl relative overflow-hidden transition-transform active:scale-95 border border-black/5"
      style={{ backgroundColor: theme }}
    >
      <Link href={`/room/${room.slug}`} onClick={onOpen} className="absolute inset-0 z-0" />

      {/* Top row: bookmark left, badges top-right stacked */}
      <div className="flex items-start justify-between p-3.5 z-10">
        {/* Bookmark */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSave(); }}
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

        {/* Two badges stacked vertically, top-right */}
        <div className="z-10 flex flex-col items-end gap-1">
          <VisibilityBadge isPrivate={room.isPrivate} />
          <ContentBadge isAdult={room.isAdult} />
        </div>
      </div>

      {/* Bottom: title + meta */}
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
}

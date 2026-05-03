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

export default function RoomTile({ room, isSaved, onSave, onOpen }: any) {
  const [copied, setCopied] = useState(false);
  const theme = room.color || "#000000";
  const textColor = getContrastColor(theme);
  const subTextColor = textColor === "#000000" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)";

  // ✅ Never show negative saved count
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
      className="aspect-square rounded-[2.5rem] p-5 flex flex-col justify-between shadow-xl relative overflow-hidden transition-transform active:scale-95 border border-black/5"
      style={{ backgroundColor: theme }}
    >
      <Link href={`/room/${room.slug}`} onClick={onOpen} className="absolute inset-0 z-0" />

      <h3
        className="font-black text-lg leading-tight uppercase z-10 pointer-events-none truncate-text"
        style={{ color: textColor }}
      >
        {room.title}
      </h3>

      <div className="flex items-end justify-between z-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: subTextColor }}>
            {displaySavedCount} Saved
          </p>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 mt-1 text-[9px] transition-colors"
            style={{ color: subTextColor }}
          >
            {copied ? <Check size={10} className="text-green-500" /> : <Share2 size={10} />}
            <span className="truncate w-16 uppercase font-bold">/{room.slug}</span>
          </button>
        </div>

        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSave(); }}
          className="p-2.5 rounded-full backdrop-blur-md border transition-all"
          style={{
            backgroundColor: textColor === "#000000" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.1)",
            borderColor: textColor === "#000000" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
          }}
        >
          <Bookmark
            size={20}
            fill={isSaved ? "black" : "none"}
            color={isSaved ? "black" : "white"}
            strokeWidth={3}
          />
        </button>
      </div>
    </div>
  );
}

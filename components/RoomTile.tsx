"use client";
import { useState } from 'react';
import { Bookmark, Share2, Check } from 'lucide-react';
import Link from 'next/link';

export default function RoomTile({ room, isSaved, onSave, onOpen }: any){
  const [copied, setCopied] = useState(false);
  const theme = room.color || "#000000";

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop Link from firing
    e.stopPropagation(); // Stop parent click
    navigator.clipboard.writeText(`dropgallery.com/room/${room.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="aspect-square rounded-[2.5rem] p-5 flex flex-col justify-between shadow-xl relative overflow-hidden transition-transform active:scale-95 border border-black/5"
      style={{ backgroundColor: theme }}
    >
      <Link href={`/room/${room.slug}`} onClick={onOpen} className="absolute inset-0 z-0" />

<h3 className="font-black text-lg text-white leading-tight uppercase drop-shadow-md z-10 pointer-events-none truncate-text">
  {room.title}
</h3>

      <div className="flex items-end justify-between z-10">
        <div>
          <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">{room.savedCount || 0} Saved</p>
          <button 
            onClick={handleShare}
            className="flex items-center gap-1 mt-1 text-white/50 text-[9px] hover:text-white transition-colors"
          >
            {copied ? <Check size={10} className="text-green-300" /> : <Share2 size={10} />}
            <span className="truncate w-16 uppercase font-bold">/{room.slug}</span>
          </button>
        </div>

        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSave(); }}
          className="bg-white/20 p-2.5 rounded-full backdrop-blur-md border border-white/30 hover:bg-white/40 transition-all"
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
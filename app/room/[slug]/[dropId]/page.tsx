"use client";

import { useState, useEffect } from 'react';
import {
  Heart,
  ThumbsDown,
  ArrowLeft,
  MessageSquarePlus,
  X
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import AppGuard from '@/components/AppGuard';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function DropDetailPage() {
  const { slug, dropId } = useParams();
  const router = useRouter();

  const [room, setRoom] = useState<any>(null);
  const [drop, setDrop] = useState<any>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyName, setReplyName] = useState("");

  const formatTime = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 300) return "5 mins ago";
    if (diff < 600) return "10 mins ago";
    if (diff < 1800) return "30 mins ago";
    if (diff < 3600) return "1 hour ago";
    if (diff < 7200) return "2 hours ago";
    if (diff < 18000) return "5 hours ago";
    if (diff < 36000) return "10 hours ago";
    if (diff < 72000) return "20 hours ago";
    if (diff < 86400) return "1 day ago";
    if (diff < 172800) return "2 days ago";
    if (diff < 259200) return "3 days ago";
    if (diff < 345600) return "4 days ago";
    if (diff < 432000) return "5 days ago";
    if (diff < 518400) return "6 days ago";
    if (diff < 604800) return "1 week ago";
    return past.toLocaleDateString();
  };

  const fetchData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/rooms/${slug}`);
      const data = await res.json();
      setRoom(data.room);
      const foundDrop = data.drops.find((d: any) => String(d._id).trim() === String(dropId).trim());
      if (foundDrop) setDrop(foundDrop);
    } catch (err) {
      console.error("Error fetching drop detail:", err);
    }
  };

  useEffect(() => { fetchData(); }, [slug, dropId]);

  const handleVote = async (type: 'likes' | 'dislikes') => {
    const userId = localStorage.getItem('avatarIndex') || 'anon-' + Math.random();
    try {
      await fetch(`${BASE_URL}/api/drops/${dropId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type })
      });
      fetchData();
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    const apiUrl = BASE_URL.replace(/\/$/, "");
    try {
      const res = await fetch(`${apiUrl}/api/drops/${String(dropId).trim()}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          content: replyContent,
          tempName: replyName || "Anonymous",
          avatarIndex: parseInt(localStorage.getItem('avatarIndex') || "0")
        })
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Reply failed:", text.slice(0, 100));
        return;
      }

      setReplyContent("");
      setReplyName("");
      setShowReplyModal(false);
      fetchData();
    } catch (err) {
      console.error("Network Error:", err);
    }
  };

  if (!room || !drop) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-xl font-black italic animate-pulse uppercase tracking-tighter text-white/60">Loading Drop...</div>
    </div>
  );

  const hasLiked = drop.likes.includes(localStorage.getItem('avatarIndex') || 'anon');
  const hasDisliked = drop.dislikes.includes(localStorage.getItem('avatarIndex') || 'anon');
  const replies = drop.replies || [];

  return (
    <AppGuard>
      <main
        className="min-h-screen pb-32 relative"
        style={{ backgroundColor: `${room.color}05` }}
      >

        {/* HEADER */}
        <header className="px-6 py-5 bg-black/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 border border-white/20 rounded-xl bg-black flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1
              className="text-lg font-black uppercase italic tracking-tight"
              style={{ color: room.color }}
            >
              {room.title}
            </h1>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Drop Thread</p>
          </div>
        </header>

        {/* MAIN DROP — full width, prominent */}
        <div className="px-4 pt-6 pb-4">
          <div
            className="w-full rounded-[2rem] p-6 border border-white/10 bg-[#0a0a0a] shadow-[0_8px_40px_rgba(0,0,0,0.8)]"
            style={{
              backgroundColor: `${room.color}15`,
              borderLeft: `4px solid ${room.color}60`
            }}
          >
            {/* Author row */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={`/avatars/${drop.avatarIndex}.png`}
                className="w-10 h-10 rounded-full border-2 shadow-md flex-shrink-0"
                style={{ borderColor: `${room.color}40` }}
                alt="Avatar"
              />
              <div>
                <p className="text-sm font-black uppercase text-white/80">{drop.tempName}</p>
                <p className="text-[9px] font-bold uppercase text-white/30 tracking-widest">{formatTime(drop.createdAt)}</p>
              </div>
            </div>

            {/* Image if any */}
            {drop.image && (
              <img
                src={drop.image}
                className="rounded-2xl mb-4 w-full border border-black/10 object-cover max-h-80"
                alt="Drop"
              />
            )}

            {/* Full content — no truncation */}
            <p className="text-base font-medium leading-relaxed text-white/90 whitespace-pre-wrap">
              {drop.content}
            </p>

            {/* Votes */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-6">
              <button
                onClick={() => handleVote('likes')}
                className={`flex items-center gap-2 text-sm font-black transition-colors ${hasLiked ? 'text-white' : 'text-white/40 hover:text-white'}`}
              >
                <Heart size={16} fill={hasLiked ? "currentColor" : "none"} />
                {drop.likes.length}
              </button>
              <button
                onClick={() => handleVote('dislikes')}
                className={`flex items-center gap-2 text-sm font-black transition-colors ${hasDisliked ? 'text-white' : 'text-white/40 hover:text-white'}`}
              >
                <ThumbsDown size={16} fill={hasDisliked ? "currentColor" : "none"} />
                {drop.dislikes.length}
              </button>
              <span className="ml-auto text-[9px] font-black uppercase text-white/20">
                {replies.length} subdrop{replies.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* SUBDROPS SECTION */}
        {replies.length > 0 && (
          <div className="px-4 mt-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3 pl-1">
              Subdrops
            </p>
            <div className="space-y-3">
              {replies.map((reply: any, i: number) => (
                <div
                  key={i}
                  className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <img
                    src={`/avatars/${reply.avatarIndex ?? 0}.png`}
                    className="w-8 h-8 rounded-full border border-white/10 bg-black shadow-sm flex-shrink-0 mt-1"
                    alt="Avatar"
                  />
                  <div
                    className="flex-1 p-4 rounded-2xl rounded-tl-none border border-white/8 bg-white/[0.03]"
                    style={{ borderLeftColor: `${room.color}30`, borderLeftWidth: '2px' }}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                        {reply.tempName || "Anonymous"}
                      </span>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed font-medium whitespace-pre-wrap">
                      {reply.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {replies.length === 0 && (
          <div className="px-4 mt-4 text-center py-10">
            <p className="text-[11px] font-black uppercase text-white/20 tracking-widest">No subdrops yet</p>
            <p className="text-[10px] text-white/10 mt-1">Be the first to reply</p>
          </div>
        )}

        {/* REPLY FAB */}
        <button
          onClick={() => setShowReplyModal(true)}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 h-14 px-8 bg-black rounded-full flex items-center justify-center gap-2 shadow-2xl z-50 transition-transform active:scale-90 hover:scale-105 border-2 border-white/20 font-black uppercase tracking-[0.15em] text-sm"
          style={{ borderColor: `${room.color}40` }}
        >
          <MessageSquarePlus size={18} style={{ color: room.color }} />
          <span>Reply</span>
        </button>

        {/* REPLY MODAL */}
        {showReplyModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
            <div className="w-full max-w-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl animate-in slide-in-from-bottom-10 duration-300 bg-[#0a0a0a]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase italic tracking-tighter">Reply</h2>
                <button
                  onClick={() => { setShowReplyModal(false); setReplyContent(""); setReplyName(""); }}
                  className="p-1 hover:rotate-90 transition-transform text-white/60 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <input
                value={replyName}
                onChange={(e) => setReplyName(e.target.value)}
                placeholder="Display Name..."
                className="w-full mb-4 p-4 rounded-xl bg-black border border-white/10 text-white text-sm outline-none font-bold placeholder:text-white/30 focus:bg-[#111] transition-colors"
              />

              <textarea
                maxLength={400}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="What's the tea?"
                className="w-full p-4 rounded-xl bg-black border border-white/10 text-white text-sm outline-none resize-none h-28 placeholder:text-white/30 focus:bg-[#111] transition-colors"
              />

              <p className="text-[10px] text-right mt-1 text-white/30 font-bold mb-6">
                {replyContent.length}/400
              </p>

              <button
  onClick={handleReply}
  className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] active:scale-95 transition-all shadow-lg hover:bg-gray-100"
>
  Drop Reply
</button>
            </div>
          </div>
        )}

      </main>
    </AppGuard>
  );
}

"use client";

import { useState, useEffect, useRef } from 'react';
import { Heart, ThumbsDown, ArrowLeft, MessageSquarePlus, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import AppGuard from '@/components/AppGuard';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const POLL_INTERVAL = 3000;

function HighlightedError({ text, abusiveWord }: { text: string; abusiveWord?: string }) {
  if (!abusiveWord || !text) return <span>{text}</span>;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(abusiveWord.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <span className="text-red-500 font-black">{text.slice(idx, idx + abusiveWord.length)}</span>
      {text.slice(idx + abusiveWord.length)}
    </span>
  );
}

export default function DropDetailPage() {
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replyAbusiveWord, setReplyAbusiveWord] = useState<string | null>(null);
  const { slug, dropId } = useParams();
  const router = useRouter();

  const [room, setRoom] = useState<any>(null);
  const [drop, setDrop] = useState<any>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyName, setReplyName] = useState("");
  const [newReplyIndexes, setNewReplyIndexes] = useState<number[]>([]);

  const knownReplyCountRef = useRef<number>(0);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const repliesEndRef = useRef<HTMLDivElement | null>(null);

  // Stable userId per device
  const userId = typeof window !== 'undefined'
    ? (localStorage.getItem('userId') || (() => {
        const id = 'user-' + Math.random().toString(36).slice(2);
        localStorage.setItem('userId', id);
        return id;
      })())
    : 'anon';

  const formatTime = (dateString: string) => {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 300) return "5 mins ago";
    if (diff < 600) return "10 mins ago";
    if (diff < 1800) return "30 mins ago";
    if (diff < 3600) return "1 hour ago";
    if (diff < 7200) return "2 hours ago";
    if (diff < 18000) return "5 hours ago";
    if (diff < 36000) return "10 hours ago";
    if (diff < 86400) return "1 day ago";
    if (diff < 172800) return "2 days ago";
    if (diff < 604800) return "1 week ago";
    return new Date(dateString).toLocaleDateString();
  };

  const fetchData = async (silent = false) => {
    try {
      const res = await fetch(`${BASE_URL}/api/rooms/${slug}`);
      const data = await res.json();
      const foundDrop = data.drops.find((d: any) => String(d._id).trim() === String(dropId).trim());
      if (!foundDrop) return;
      const replies = foundDrop.replies || [];
      if (!silent) {
        knownReplyCountRef.current = replies.length;
        setRoom(data.room);
        setDrop(foundDrop);
        return;
      }
      const prevCount = knownReplyCountRef.current;
      const newCount = replies.length;
      if (newCount > prevCount) {
        const newIndexes = Array.from({ length: newCount - prevCount }, (_, i) => prevCount + i);
        setNewReplyIndexes(newIndexes);
        knownReplyCountRef.current = newCount;
        setTimeout(() => repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        setTimeout(() => setNewReplyIndexes([]), 800);
      }
      setRoom(data.room);
      setDrop(foundDrop);
    } catch { }
  };

  useEffect(() => {
    fetchData(false);
    pollRef.current = setInterval(() => fetchData(true), POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [slug, dropId]);

  const handleVote = async (type: 'likes' | 'dislikes') => {
    try {
      await fetch(`${BASE_URL}/api/drops/${dropId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type })
      });
      fetchData(true);
    } catch { }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setReplyError(null); setReplyAbusiveWord(null);
    const apiUrl = BASE_URL.replace(/\/$/, "");
    const res = await fetch(`${apiUrl}/api/drops/${String(dropId).trim()}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        content: replyContent,
        tempName: replyName || "Anonymous",
        avatarIndex: parseInt(localStorage.getItem('avatarIndex') || "0")
      })
    });
    if (!res.ok) {
      const result = await res.json();
      setReplyError(result.error || "Something went wrong.");
      setReplyAbusiveWord(result.abusiveWord || null);
      setTimeout(() => { setReplyError(null); setReplyAbusiveWord(null); }, 3000);
      return;
    }
    setReplyContent(""); setReplyName("");
    setShowReplyModal(false);
    fetchData(true);
    setTimeout(() => repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
  };

  if (!room || !drop) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-xl font-black italic animate-pulse uppercase tracking-tighter text-white/60">Loading Drop...</div>
    </div>
  );

  const hasLiked = drop.likes.includes(userId);
  const hasDisliked = drop.dislikes.includes(userId);
  const replies = drop.replies || [];

  return (
    <AppGuard>
      <main className="min-h-screen pb-32 relative" style={{ backgroundColor: `${room.color}05` }}>

        {/* HEADER */}
        <header className="px-6 py-5 bg-black/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 flex items-center gap-4">
          <button
            onClick={() => { if (pollRef.current) clearInterval(pollRef.current); router.back(); }}
            className="p-2 border border-white/20 rounded-xl bg-black flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-black uppercase italic tracking-tight" style={{ color: room.color }}>{room.title}</h1>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Drop Thread</p>
          </div>
        </header>

        {/* MAIN DROP */}
        <div className="px-4 pt-6 pb-4">
          <div className="w-full rounded-[2rem] p-6 border border-white/10 bg-[#0a0a0a] shadow-[0_8px_40px_rgba(0,0,0,0.8)]"
            style={{ backgroundColor: `${room.color}15`, borderLeft: `4px solid ${room.color}60` }}>
            <div className="flex items-center gap-3 mb-4">
              <img src={`/avatars/${drop.avatarIndex}.png`} className="w-10 h-10 rounded-full border-2 shadow-md flex-shrink-0"
                style={{ borderColor: `${room.color}40` }} alt="Avatar" />
              <div>
                <p className="text-sm font-black uppercase text-white/80">{drop.tempName}</p>
                <p className="text-[9px] font-bold uppercase text-white/30 tracking-widest">{formatTime(drop.createdAt)}</p>
              </div>
            </div>
            <p className="text-base font-medium leading-relaxed text-white/90 whitespace-pre-wrap">{drop.content}</p>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-6">
              <button onClick={() => handleVote('likes')}
                className={`flex items-center gap-2 text-sm font-black transition-colors ${hasLiked ? 'text-white' : 'text-white/40 hover:text-white'}`}>
                <Heart size={16} fill={hasLiked ? "currentColor" : "none"} /> {drop.likes.length}
              </button>
              <button onClick={() => handleVote('dislikes')}
                className={`flex items-center gap-2 text-sm font-black transition-colors ${hasDisliked ? 'text-white' : 'text-white/40 hover:text-white'}`}>
                <ThumbsDown size={16} fill={hasDisliked ? "currentColor" : "none"} /> {drop.dislikes.length}
              </button>
              <span className="ml-auto text-[9px] font-black uppercase text-white/20">
                {replies.length} subdrop{replies.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* SUBDROPS */}
        <div className="px-4 mt-2">
          {replies.length > 0 && (
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3 pl-1">Subdrops</p>
          )}
          <div className="space-y-3">
            {replies.map((reply: any, i: number) => {
              const isNewReply = newReplyIndexes.includes(i);
              return (
                <div key={i}
                  className={`flex gap-3 items-start transition-all duration-500 ${isNewReply ? 'opacity-0 translate-y-4 animate-[fadeSlideUp_0.5s_ease_forwards]' : 'opacity-100'}`}
                  style={isNewReply ? { animationDelay: `${(i - (replies.length - newReplyIndexes.length)) * 80}ms` } : {}}>
                  <img src={`/avatars/${reply.avatarIndex ?? 0}.png`}
                    className="w-8 h-8 rounded-full border border-white/10 bg-black shadow-sm flex-shrink-0 mt-1" alt="Avatar" />
                  <div className="flex-1 p-4 rounded-2xl rounded-tl-none border border-white/[0.08] bg-white/[0.03]"
                    style={{ borderLeftColor: `${room.color}30`, borderLeftWidth: '2px' }}>
                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest block mb-1.5">{reply.tempName || "Anonymous"}</span>
                    <p className="text-sm text-white/80 leading-relaxed font-medium whitespace-pre-wrap">{reply.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={repliesEndRef} />
          </div>
          {replies.length === 0 && (
            <div className="text-center py-10">
              <p className="text-[11px] font-black uppercase text-white/20 tracking-widest">No subdrops yet</p>
              <p className="text-[10px] text-white/10 mt-1">Be the first to reply</p>
            </div>
          )}
        </div>

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
                <button onClick={() => { setShowReplyModal(false); setReplyContent(""); setReplyName(""); setReplyError(null); }}
                  className="p-1 hover:rotate-90 transition-transform text-white/60 hover:text-white"><X size={20} /></button>
              </div>
              <input value={replyName} onChange={(e) => setReplyName(e.target.value)}
                placeholder="Display Name..."
                className="w-full mb-4 p-4 rounded-xl bg-black border border-white/10 text-white text-sm outline-none font-bold placeholder:text-white/30 focus:bg-[#111] transition-colors" />
              <textarea maxLength={400} value={replyContent}
                onChange={(e) => { setReplyContent(e.target.value); setReplyError(null); setReplyAbusiveWord(null); }}
                className={`w-full p-4 rounded-xl bg-black border text-white text-sm outline-none resize-none h-28 transition-all duration-300 ${replyError ? 'border-red-600 animate-shake shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'border-white/10 focus:bg-[#111]'}`}
                placeholder="What's the tea?" />
              {replyError && (
                <p className="text-[10px] font-black uppercase mt-1 animate-pulse text-white/70">
                  <HighlightedError text={replyError} abusiveWord={replyAbusiveWord || undefined} />
                </p>
              )}
              <p className="text-[10px] text-right mt-1 text-white/30 font-bold mb-6">{replyContent.length}/400</p>
              <button onClick={handleReply}
                className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] active:scale-95 transition-all shadow-lg hover:bg-gray-100">
                Drop Reply
              </button>
            </div>
          </div>
        )}

      </main>
    </AppGuard>
  );
}

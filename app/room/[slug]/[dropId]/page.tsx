"use client";

import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import { Heart, ThumbsDown, MessageCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import AppGuard from '@/components/AppGuard';
import Sheet, { PrimaryButton, fieldClass } from '@/components/Sheet';
import { RoomBackdrop, RoomHeader } from '@/components/RoomChrome';
import { BASE_URL, formatTime, getUserId, authHeaders } from '@/lib/rooms';

const POLL_INTERVAL = 4000;
const hint = { color: 'var(--ink-2)' } as CSSProperties;

function HighlightedError({ text, abusiveWord }: { text: string; abusiveWord?: string }) {
  if (!abusiveWord || !text) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(abusiveWord.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <span className="underline decoration-2 underline-offset-2">{text.slice(idx, idx + abusiveWord.length)}</span>
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
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyName, setReplyName] = useState('');
  const [newReplyIndexes, setNewReplyIndexes] = useState<number[]>([]);

  const knownReplyCountRef = useRef<number>(0);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const repliesEndRef = useRef<HTMLDivElement | null>(null);

  const userId = getUserId();

  const fetchData = useCallback(async (silent = false) => {
    try {
      const res = await fetch(`${BASE_URL}/api/rooms/${slug}`, { headers: authHeaders(String(slug)) });
      const data = await res.json();
      const found = data.drops.find((d: any) => String(d._id).trim() === String(dropId).trim());
      if (!found) return;
      const replies = found.replies || [];
      if (!silent) {
        knownReplyCountRef.current = replies.length;
        setRoom(data.room);
        setDrop(found);
        return;
      }
      const prev = knownReplyCountRef.current;
      if (replies.length > prev) {
        setNewReplyIndexes(Array.from({ length: replies.length - prev }, (_, i) => prev + i));
        knownReplyCountRef.current = replies.length;
        setTimeout(() => repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        setTimeout(() => setNewReplyIndexes([]), 800);
      }
      setRoom(data.room);
      setDrop(found);
    } catch { /* keep last good data */ }
  }, [slug, dropId]);

  useEffect(() => {
    fetchData(false);
    pollRef.current = setInterval(() => fetchData(true), POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchData]);

  const handleVote = async (type: 'likes' | 'dislikes') => {
    try {
      await fetch(`${BASE_URL}/api/drops/${dropId}/vote`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders(String(slug)) }, body: JSON.stringify({ userId, type }),
      });
      fetchData(true);
    } catch { /* ignore */ }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setReplyError(null); setReplyAbusiveWord(null);
    const apiUrl = BASE_URL.replace(/\/$/, '');
    const res = await fetch(`${apiUrl}/api/drops/${String(dropId).trim()}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeaders(String(slug)) },
      body: JSON.stringify({
        content: replyContent,
        tempName: replyName || 'Anonymous',
        avatarIndex: parseInt(localStorage.getItem('avatarIndex') || '0'),
      }),
    });
    if (!res.ok) {
      const result = await res.json();
      setReplyError(result.error || 'Something went wrong');
      setReplyAbusiveWord(result.abusiveWord || null);
      setTimeout(() => { setReplyError(null); setReplyAbusiveWord(null); }, 3000);
      return;
    }
    setReplyContent(''); setReplyName('');
    setShowReply(false);
    fetchData(true);
    setTimeout(() => repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
  };

  // router.back() restores the room from cache, so the private gate never re-triggers
  const handleBack = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (window.history.length > 1) router.back();
    else router.push(`/room/${slug}`);
  };

  if (!room || !drop) {
    return (
      <div className="min-h-screen relative">
        <RoomHeader title="" onBack={() => router.push(`/room/${slug}`)} />
        <div className="px-4 max-w-[32rem] mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 84px)' }}>
          <div className="skeleton rounded-[32px] h-[238px]" />
        </div>
      </div>
    );
  }

  const liked = drop.likes.includes(userId);
  const disliked = drop.dislikes.includes(userId);
  const replies = drop.replies || [];
  const vars = { ['--c' as any]: room.color } as CSSProperties;

  return (
    <AppGuard>
      <main className="min-h-screen relative max-w-[32rem] mx-auto" style={{ ...vars, paddingBottom: 150 }}>
        <RoomBackdrop color={room.color} />
        <RoomHeader title={room.title} lock={room.isPrivate} onBack={handleBack} />

        <div className="px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 84px)' }}>
          {/* the drop */}
          <article className="tint-card rounded-[32px] p-5" style={vars}>
            <div className="flex items-center gap-3 mb-4">
              <img src={`/avatars/${drop.avatarIndex ?? 0}.png`} className="w-10 h-10 rounded-full" alt="" />
              <div className="min-w-0">
                <p className="text-[16px] font-semibold truncate" style={{ letterSpacing: '-0.015em' }}>{drop.tempName}</p>
                <p className="text-[13.5px]" style={hint}>{formatTime(drop.createdAt)}</p>
              </div>
            </div>
            <p className="text-[19.5px] leading-[1.42] font-medium whitespace-pre-wrap break-words" style={{ letterSpacing: '-0.02em' }}>{drop.content}</p>
            <div className="mt-5 flex items-center gap-2">
              <button
                onClick={() => handleVote('likes')}
                className="press h-9 px-3.5 rounded-full flex items-center gap-1.5 text-[15px] font-semibold"
                style={{ background: liked ? 'var(--ink)' : 'rgba(255,255,255,0.65)', color: liked ? '#fff' : 'var(--ink)', boxShadow: '0 0 0 0.5px rgba(0,0,0,0.06)' }}
              >
                <Heart size={15} strokeWidth={2.1} fill={liked ? 'currentColor' : 'none'} /> {drop.likes.length}
              </button>
              <button
                onClick={() => handleVote('dislikes')}
                className="press h-9 px-3.5 rounded-full flex items-center gap-1.5 text-[15px] font-semibold"
                style={{ background: disliked ? 'var(--ink)' : 'rgba(255,255,255,0.65)', color: disliked ? '#fff' : 'var(--ink)', boxShadow: '0 0 0 0.5px rgba(0,0,0,0.06)' }}
              >
                <ThumbsDown size={15} strokeWidth={2.1} fill={disliked ? 'currentColor' : 'none'} /> {drop.dislikes.length}
              </button>
            </div>
          </article>

          {/* replies */}
          <div className="mt-4 flex flex-col gap-2.5">
            {replies.map((reply: any, i: number) => {
              const fresh = newReplyIndexes.includes(i);
              return (
                <div
                  key={i}
                  className="flex gap-2.5 items-end"
                  style={fresh ? { opacity: 0, animation: `fadeSlideUp .5s ease ${(i - (replies.length - newReplyIndexes.length)) * 80}ms forwards` } : undefined}
                >
                  <img src={`/avatars/${reply.avatarIndex ?? 0}.png`} className="w-8 h-8 rounded-full shrink-0 bg-white" alt="" style={{ boxShadow: '0 0 0 0.5px rgba(0,0,0,0.08)' }} />
                  <div
                    className="glass rounded-[24px] rounded-bl-[8px] px-4 py-3 min-w-0"
                    style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.8), rgba(255,255,255,0.5))' }}
                  >
                    <span className="block text-[13px] font-semibold mb-0.5" style={hint}>{reply.tempName || 'Anonymous'}</span>
                    <p className="text-[16px] leading-[1.38] font-medium whitespace-pre-wrap break-words" style={{ letterSpacing: '-0.012em' }}>{reply.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={repliesEndRef} />
          </div>

          {replies.length === 0 && (
            <div className="flex justify-center pt-14" style={{ color: 'var(--ink-3)' }}>
              <MessageCircle size={30} strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* reply */}
        <div className="fixed inset-x-0 z-50 flex justify-center pointer-events-none" style={{ bottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
          <button
            onClick={() => setShowReply(true)}
            className="glass press pointer-events-auto h-[60px] pl-5 pr-6 rounded-full flex items-center gap-2.5 text-[18.5px] font-semibold"
            style={{ letterSpacing: '-0.02em' }}
          >
            <MessageCircle size={20} strokeWidth={2} /> Reply
          </button>
        </div>

        <Sheet open={showReply} onClose={() => { setShowReply(false); setReplyContent(''); setReplyName(''); setReplyError(null); }} title="Reply">
          <div className="flex flex-col gap-3">
            <input className={fieldClass} placeholder="Name (optional)" maxLength={30} value={replyName} onChange={(e) => setReplyName(e.target.value)} />
            <textarea
              maxLength={400} value={replyContent}
              onChange={(e) => { setReplyContent(e.target.value); setReplyError(null); setReplyAbusiveWord(null); }}
              className={`${fieldClass} h-32 resize-none ${replyError ? 'animate-shake' : ''}`}
              placeholder="Say something"
            />
            <div className="flex items-center justify-between px-1 h-5 text-[14px] font-semibold" style={hint}>
              <span>{replyError && <HighlightedError text={replyError} abusiveWord={replyAbusiveWord || undefined} />}</span>
              <span style={{ color: 'var(--ink-3)' }}>{replyContent.length}/400</span>
            </div>
            <PrimaryButton onClick={handleReply} disabled={!replyContent.trim()}>Reply</PrimaryButton>
          </div>
        </Sheet>
      </main>
    </AppGuard>
  );
}

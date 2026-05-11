"use client";

import { useState, useEffect, useRef } from 'react';
import { Heart, ThumbsDown, Copy, Plus, X, ArrowLeft, Check, MessageCircle, BarChart2, Users } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import IntroScreen from '@/components/IntroScreen';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const POLL_MS = 3000;

/* ── helpers ────────────────────────────────────────────── */
function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return 'anon';
  let id = localStorage.getItem('userId');
  if (!id) { id = 'user-' + Math.random().toString(36).slice(2); localStorage.setItem('userId', id); }
  return id;
}

function formatTime(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 300) return "5m ago";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(d).toLocaleDateString();
}

/* Highlights the abusive word red inside the error string */
function ErrorMsg({ text, word }: { text: string; word?: string | null }) {
  if (!word) return <span className="text-red-500">{text}</span>;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(word.toLowerCase());
  if (idx === -1) return <span className="text-red-500">{text}</span>;
  return (
    <span className="text-white/70">
      {text.slice(0, idx)}
      <span className="text-red-500 font-black underline">{text.slice(idx, idx + word.length)}</span>
      {text.slice(idx + word.length)}
    </span>
  );
}

/* ── main ───────────────────────────────────────────────── */
export default function RoomPage() {
  const { slug } = useParams();
  const router = useRouter();

  /* intro: show on shared links (no prior session) */
  const [showIntro, setShowIntro] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const [data, setData] = useState<any>(null);
  const [showDropModal, setShowDropModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Drop form
  const [dropName, setDropName] = useState("");
  const [dropContent, setDropContent] = useState("");
  const [dropError, setDropError] = useState<string | null>(null);
  const [dropBadWord, setDropBadWord] = useState<string | null>(null);

  // Poll form
  const [pollName, setPollName] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollMultiple, setPollMultiple] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);
  const [pollBadWord, setPollBadWord] = useState<string | null>(null);

  const [seenDrops, setSeenDrops] = useState<string[]>([]);
  const [newDropIds, setNewDropIds] = useState<string[]>([]);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const userId = getOrCreateUserId();

  /* session / intro check */
  useEffect(() => {
    const seen = sessionStorage.getItem('hasSeenIntro');
    if (!seen) setShowIntro(true);
    setSessionReady(true);
    const sd = JSON.parse(localStorage.getItem(`seenDrops-${slug}`) || '[]');
    setSeenDrops(sd);
  }, [slug]);

  /* fetch room */
  const fetchRoom = async (silent = false) => {
    try {
      const res = await fetch(`${BASE_URL}/api/rooms/${slug}`);
      const incoming = await res.json();
      if (!silent) {
        const ids = incoming.drops.map((d: any) => String(d._id).trim());
        knownIdsRef.current = new Set(ids);
        setData(incoming); return;
      }
      const incoming_ids = incoming.drops.map((d: any) => String(d._id).trim());
      const brandNew = incoming_ids.filter((id: string) => !knownIdsRef.current.has(id));
      if (brandNew.length) {
        brandNew.forEach((id: string) => knownIdsRef.current.add(id));
        setNewDropIds(prev => [...prev, ...brandNew]);
        setTimeout(() => setNewDropIds(prev => prev.filter(id => !brandNew.includes(id))), 800);
      }
      setData(incoming);
    } catch { }
  };

  useEffect(() => {
    if (!sessionReady) return;
    fetchRoom(false);
    timerRef.current = setInterval(() => fetchRoom(true), POLL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slug, sessionReady]);

  /* mark drops seen on leave */
  useEffect(() => {
    const mark = () => {
      if (!data) return;
      const cs = JSON.parse(localStorage.getItem(`seenDrops-${slug}`) || '[]');
      const newIds = data.drops.map((d: any) => String(d._id).trim()).filter((id: string) => !cs.includes(id));
      localStorage.setItem(`seenDrops-${slug}`, JSON.stringify([...cs, ...newIds]));
    };
    window.addEventListener("beforeunload", mark);
    return () => window.removeEventListener("beforeunload", mark);
  }, [data, slug]);

  /* vote on drop */
  const handleVote = async (dropId: string, type: 'likes' | 'dislikes', e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`${BASE_URL}/api/drops/${dropId}/vote`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type }),
    }).catch(() => {});
    fetchRoom(true);
  };

  /* vote on poll */
  const handlePollVote = async (pollId: string, optionIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`${BASE_URL}/api/polls/${pollId}/vote`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, optionIndex }),
    }).catch(() => {});
    fetchRoom(true);
  };

  /* create drop */
  const handleDrop = async () => {
    if (!dropContent.trim()) return;
    setDropError(null); setDropBadWord(null);
    const av = parseInt(localStorage.getItem('avatarIndex') || '0');
    const res = await fetch(`${BASE_URL}/api/drops`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: data.room._id, content: dropContent, tempName: dropName || "Anonymous", avatarIndex: av }),
    });
    if (!res.ok) {
      const r = await res.json();
      setDropError(r.error || "Something went wrong."); setDropBadWord(r.abusiveWord || null);
      setTimeout(() => { setDropError(null); setDropBadWord(null); }, 3000); return;
    }
    setShowDropModal(false); setDropContent(""); setDropName("");
    fetchRoom(true);
  };

  /* create poll */
  const handleCreatePoll = async () => {
    const opts = pollOptions.filter(o => o.trim());
    if (!pollQuestion.trim()) { setPollError("Question is required."); return; }
    if (opts.length < 2) { setPollError("At least 2 options required."); return; }
    setPollError(null); setPollBadWord(null);
    const av = parseInt(localStorage.getItem('avatarIndex') || '0');
    const res = await fetch(`${BASE_URL}/api/polls`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: data.room._id, question: pollQuestion, options: opts, allowMultiple: pollMultiple, tempName: pollName || "Anonymous", avatarIndex: av }),
    });
    if (!res.ok) {
      const r = await res.json();
      setPollError(r.error || "Something went wrong."); setPollBadWord(r.abusiveWord || null);
      setTimeout(() => { setPollError(null); setPollBadWord(null); }, 3000); return;
    }
    setShowPollModal(false); setPollQuestion(""); setPollName(""); setPollOptions(["", ""]); setPollMultiple(false);
    fetchRoom(true);
  };

  const navigateToDrop = (dropId: string) => {
    const cs = JSON.parse(localStorage.getItem(`seenDrops-${slug}`) || '[]');
    if (!cs.includes(dropId)) localStorage.setItem(`seenDrops-${slug}`, JSON.stringify([...cs, dropId]));
    router.push(`/room/${slug}/${dropId}`);
  };

  const getItemStyle = (index: number) => {
    const op = ["12", "18", "25", "10"];
    return { backgroundColor: `${data.room.color}${op[index % op.length]}`, borderLeft: `4px solid ${data.room.color}40` };
  };

  /* loading */
  if (!sessionReady) return null;
  if (showIntro) return <IntroScreen onFinish={() => { sessionStorage.setItem('hasSeenIntro', 'true'); setShowIntro(false); }} />;
  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl font-black italic animate-pulse uppercase tracking-tighter">Fetching Drops...</div>
    </div>
  );

  /* merge feed */
  const drops = (data.drops || []).map((d: any) => ({ ...d, _type: 'drop' }));
  const polls = (data.polls || []).map((p: any) => ({ ...p, _type: 'poll' }));
  const feed = [...drops, ...polls].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <main className="min-h-screen pb-32 relative overflow-x-hidden" style={{ backgroundColor: `${data.room.color}05` }}>

      {/* HEADER */}
      <header className="p-5 bg-black/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 flex items-center">
        <button onClick={() => {
          const cs = JSON.parse(localStorage.getItem(`seenDrops-${slug}`) || '[]');
          const nids = data.drops.map((d: any) => String(d._id).trim()).filter((id: string) => !cs.includes(id));
          localStorage.setItem(`seenDrops-${slug}`, JSON.stringify([...cs, ...nids]));
          if (timerRef.current) clearInterval(timerRef.current);
          if (window.history.length <= 2) router.push('/'); else router.back();
        }} className="p-2 border border-white/20 rounded-xl bg-black">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 text-center pr-10">
          <h1 className="text-2xl font-black uppercase italic truncate max-w-[220px] mx-auto" style={{ color: data.room.color }}>{data.room.title}</h1>
          <div className="flex items-center justify-center gap-2 mt-0.5 text-[9px] font-bold text-white/25 tracking-widest uppercase">
            <span>blackbox-omega-peach.vercel.app/room/{slug}</span>
            <button onClick={() => { navigator.clipboard.writeText(`${window.location.host}/room/${slug}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
              {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
            </button>
          </div>
        </div>
      </header>

      {/* FEED */}
      <div className="p-4 masonry-grid">
        {feed.map((item: any, idx: number) => {
          if (item._type === 'poll') {
            const totalV = item.options.reduce((s: number, o: any) => s + o.voters.length, 0);
            const userVoted = item.options.some((o: any) => o.voters.includes(userId));
            return (
              <div key={String(item._id)} className="masonry-item p-5 rounded-[2rem] border border-white/10 bg-[#0a0a0a] shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex flex-col" style={getItemStyle(idx)}>
                <div className="flex items-center gap-2 mb-3">
                  <img src={`/avatars/${item.avatarIndex ?? 0}.png`} className="w-8 h-8 rounded-full border shadow-sm" alt="" />
                  <span className="text-[10px] font-black uppercase text-white/60 truncate max-w-[70px]">{item.tempName}</span>
                  <div className="ml-auto flex items-center gap-1 bg-[#a78bfa]/10 border border-[#a78bfa]/20 rounded-full px-2 py-0.5">
                    <BarChart2 size={8} className="text-[#a78bfa]" />
                    <span className="text-[7px] font-black uppercase text-[#a78bfa]">Poll</span>
                  </div>
                </div>
                <p className="text-sm font-bold text-white/90 mb-3 leading-snug">{item.question}</p>
                <div className="flex flex-col gap-1.5">
                  {item.options.map((opt: any, i: number) => {
                    const pct = totalV > 0 ? Math.round((opt.voters.length / totalV) * 100) : 0;
                    const voted = opt.voters.includes(userId);
                    return (
                      <button key={i} onClick={(e) => handlePollVote(String(item._id), i, e)}
                        className="relative overflow-hidden rounded-xl border border-white/10 text-left active:scale-[0.98] transition-transform"
                        style={{ background: "rgba(255,255,255,0.04)" }}>
                        {userVoted && <div className="absolute inset-y-0 left-0 rounded-xl" style={{ width: `${pct}%`, background: voted ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.06)", transition: 'width 0.7s ease' }} />}
                        <div className="relative px-3 py-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${voted ? 'border-[#a78bfa] bg-[#a78bfa]' : 'border-white/25'}`} />
                            <span className="text-[11px] text-white/80">{opt.text}</span>
                          </div>
                          {userVoted && <span className="text-[9px] font-black text-white/40 shrink-0">{pct}%</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[9px] text-white/30 font-bold"><Users size={10} /><span>{totalV} vote{totalV !== 1 ? 's' : ''}</span></div>
                  <span className="text-[8px] font-black uppercase text-white/25">{formatTime(item.createdAt)}</span>
                </div>
              </div>
            );
          }

          // DROP CARD
          const dropId = String(item._id).trim();
          const hasLiked = item.likes.includes(userId);
          const hasDisliked = item.dislikes.includes(userId);
          const isNew = !seenDrops.includes(dropId);
          const rc = (item.replies || []).length;
          const isLong = item.content.length > 50;
          const display = isLong ? item.content.slice(0, 50) + "…" : item.content;
          const justArrived = newDropIds.includes(dropId);

          return (
            <div key={dropId} onClick={() => navigateToDrop(dropId)}
              className={`relative masonry-item p-5 rounded-[2rem] border border-white/10 bg-[#0a0a0a] shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex flex-col transition-all duration-300 cursor-pointer hover:scale-[1.01] hover:border-white/20 active:scale-[0.98] ${justArrived ? 'new-drop-liquid' : ''}`}
              style={getItemStyle(idx)}>
              {isNew && <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full" />}
              <div className="flex items-center gap-2 mb-3">
                <img src={`/avatars/${item.avatarIndex}.png`} className="w-8 h-8 rounded-full border shadow-sm" alt="" />
                <span className="text-[10px] font-black uppercase text-white/60 truncate max-w-[100px]">{item.tempName}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium leading-relaxed text-white/80">{display}</p>
                {isLong && (
                  <button onClick={(e) => { e.stopPropagation(); navigateToDrop(dropId); }}
                    className="text-[10px] font-black uppercase mt-1 hover:text-white" style={{ color: data.room.color }}>read more</button>
                )}
              </div>
              <div className="mt-4 border-t border-white/10 pt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <button onClick={(e) => handleVote(dropId, 'likes', e)} className={`flex items-center gap-1 text-[10px] font-black ${hasLiked ? 'text-white' : 'text-white/40 hover:text-white'}`}>
                      <Heart size={12} fill={hasLiked ? "currentColor" : "none"} /> {item.likes.length}
                    </button>
                    <button onClick={(e) => handleVote(dropId, 'dislikes', e)} className={`flex items-center gap-1 text-[10px] font-black ${hasDisliked ? 'text-white' : 'text-white/40 hover:text-white'}`}>
                      <ThumbsDown size={12} fill={hasDisliked ? "currentColor" : "none"} /> {item.dislikes.length}
                    </button>
                  </div>
                  <span className="text-[8px] font-black uppercase text-white/25">{formatTime(item.createdAt)}</span>
                </div>
                {rc > 0 && <div className="flex items-center gap-1 text-[10px] font-black text-white/30"><MessageCircle size={11} /><span>{rc} subdrop{rc !== 1 ? 's' : ''}</span></div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* FAB MENU */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
        <AnimatePresence>
          {showFabMenu && (
            <>
              <motion.button initial={{ opacity: 0, y: 16, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.8 }} transition={{ delay: 0.04 }}
                onClick={() => { setShowFabMenu(false); setShowPollModal(true); }}
                className="w-14 h-14 bg-[#0a0a0a] rounded-full flex flex-col items-center justify-center shadow-2xl border-2 border-[#a78bfa]/40 active:scale-90 transition-transform">
                <BarChart2 size={20} className="text-[#a78bfa]" />
                <span className="text-[6px] font-black uppercase text-[#a78bfa] tracking-wider mt-0.5">Poll</span>
              </motion.button>
              <motion.button initial={{ opacity: 0, y: 16, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.8 }}
                onClick={() => { setShowFabMenu(false); setShowDropModal(true); }}
                className="w-14 h-14 bg-[#0a0a0a] rounded-full flex flex-col items-center justify-center shadow-2xl border-2 border-white/20 active:scale-90 transition-transform">
                <MessageCircle size={20} className="text-white" />
                <span className="text-[6px] font-black uppercase text-white/60 tracking-wider mt-0.5">Drop</span>
              </motion.button>
            </>
          )}
        </AnimatePresence>
        <button onClick={() => setShowFabMenu(p => !p)}
          className="w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-90 hover:scale-105 border-2 border-white/20">
          <motion.div animate={{ rotate: showFabMenu ? 45 : 0 }} transition={{ duration: 0.2 }}>
            <Plus color="white" size={32} />
          </motion.div>
        </button>
      </div>

      {/* FAB BACKDROP */}
      <AnimatePresence>
        {showFabMenu && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowFabMenu(false)} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        )}
      </AnimatePresence>

      {/* DROP MODAL */}
      <AnimatePresence>
        {showDropModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-md rounded-[2.5rem] p-8 border border-white/10 bg-[#0a0a0a] shadow-2xl">
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-black uppercase italic">New Drop</h2>
                <button onClick={() => { setShowDropModal(false); setDropError(null); }} className="hover:rotate-90 transition-transform text-white/40 hover:text-white"><X /></button>
              </div>
              <input className="w-full border border-white/10 bg-black text-white p-4 rounded-xl mb-4 font-bold outline-none placeholder:text-white/30 focus:bg-[#111]"
                placeholder="Display Name..." value={dropName} onChange={e => setDropName(e.target.value)} />
              <textarea maxLength={400}
                className={`w-full border p-4 rounded-xl mb-2 h-36 resize-none outline-none bg-black text-white transition-all ${dropError ? 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)] animate-shake' : 'border-white/10 focus:bg-[#111]'}`}
                placeholder="What's the tea?" value={dropContent}
                onChange={e => { setDropContent(e.target.value); setDropError(null); setDropBadWord(null); }} />
              {dropError && (
                <p className="text-[10px] font-black uppercase mb-2 animate-pulse">
                  <ErrorMsg text={dropError} word={dropBadWord} />
                </p>
              )}
              <p className="text-[10px] text-white/25 text-right font-bold mb-6">{dropContent.length}/400</p>
              <button onClick={handleDrop} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-zinc-200 active:scale-95 transition-all">Drop It</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POLL MODAL */}
      <AnimatePresence>
        {showPollModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-md rounded-[2.5rem] p-8 border border-white/10 bg-[#0a0a0a] shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart2 size={18} className="text-[#a78bfa]" />
                  <h2 className="text-xl font-black uppercase italic">New Poll</h2>
                </div>
                <button onClick={() => { setShowPollModal(false); setPollError(null); }} className="hover:rotate-90 transition-transform text-white/40 hover:text-white"><X /></button>
              </div>
              <input className="w-full border border-white/10 bg-black text-white p-4 rounded-xl mb-4 font-bold outline-none placeholder:text-white/30 focus:bg-[#111]"
                placeholder="Display Name..." value={pollName} onChange={e => setPollName(e.target.value)} />
              <textarea maxLength={200}
                className={`w-full border p-4 rounded-xl mb-4 h-24 resize-none outline-none bg-black text-white ${pollError ? 'border-red-600' : 'border-white/10 focus:bg-[#111]'}`}
                placeholder="Ask something..." value={pollQuestion}
                onChange={e => { setPollQuestion(e.target.value); setPollError(null); }} />
              <p className="text-[10px] font-black uppercase text-white/35 tracking-widest mb-3">Options (2–4)</p>
              <div className="flex flex-col gap-2 mb-4">
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input maxLength={80}
                      className="flex-1 border border-white/10 bg-black text-white p-3 rounded-xl font-bold outline-none placeholder:text-white/25 focus:bg-[#111] text-sm"
                      placeholder={`Option ${i + 1}`} value={opt}
                      onChange={e => { const u = [...pollOptions]; u[i] = e.target.value; setPollOptions(u); setPollError(null); }} />
                    {pollOptions.length > 2 && (
                      <button onClick={() => setPollOptions(p => p.filter((_, j) => j !== i))} className="text-white/30 hover:text-white"><X size={14} /></button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 4 && (
                  <button onClick={() => setPollOptions(p => [...p, ""])} className="text-[10px] font-black uppercase text-[#a78bfa] tracking-widest text-left mt-1">+ Add option</button>
                )}
              </div>
              {/* Multiple choice toggle */}
              <div className="flex items-center gap-3 mb-6 p-4 rounded-xl border border-white/10 bg-black/30">
                <button onClick={() => setPollMultiple(p => !p)}
                  className={`w-10 h-5 rounded-full relative transition-all ${pollMultiple ? 'bg-[#a78bfa]' : 'bg-white/10'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${pollMultiple ? 'left-5' : 'left-0.5'}`} />
                </button>
                <div>
                  <p className="text-[11px] font-black uppercase text-white/65 tracking-wider">Multiple Choice</p>
                  <p className="text-[9px] text-white/30">Allow selecting more than one option</p>
                </div>
              </div>
              {pollError && (
                <p className="text-[10px] font-black uppercase mb-4 animate-pulse">
                  <ErrorMsg text={pollError} word={pollBadWord} />
                </p>
              )}
              <button onClick={handleCreatePoll}
                className="w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] active:scale-95 transition-all text-black" style={{ background: "#a78bfa" }}>
                Launch Poll
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

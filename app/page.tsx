"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Flame, Plus, X, Copy, Heart, ThumbsDown, BarChart2, Users, ChevronRight, Check } from 'lucide-react';
import RoomTile from '@/components/RoomTile';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import IntroScreen from '@/components/IntroScreen';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/* ─── helpers ───────────────────────────────────────────── */
function formatTime(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ─── animated blurb ────────────────────────────────────── */
function AnimatedBlurb() {
  const words = ["Anonymous.", "Unfiltered.", "For students."];
  const [wi, setWi] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setWi(p => (p + 1) % words.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="rounded-2xl border border-white/10 px-4 py-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#0d0d0d 0%,#111 100%)' }}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(250,201,246,0.07) 50%, transparent 100%)' }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-[#fac9f6]"
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Anonymous Platform</span>
        </div>
        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
          <span className="text-sm font-black uppercase italic tracking-tight text-white leading-tight">Gossip freely.</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={wi}
              initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.35 }}
              className="text-sm font-black uppercase italic tracking-tight"
              style={{ color: '#fac9f6' }}
            >
              {words[wi]}
            </motion.span>
          </AnimatePresence>
        </div>
        <p className="text-[10px] text-white/35 leading-relaxed font-medium">
          For college &amp; school students — no accounts, no identity, no judgment.
        </p>
        <Link href="/intro" className="mt-2 inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#fac9f6] tracking-widest">
          <span>Read more</span>
          <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>→</motion.span>
        </Link>
      </div>
    </div>
  );
}

/* ─── main ──────────────────────────────────────────────── */
export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showIntro, setShowIntro] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [tab, setTab] = useState<'browse' | 'saved'>('saved');
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomsLoaded, setRoomsLoaded] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [lastSeenMap, setLastSeenMap] = useState<any>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ title: '', color: '#22c55e' });
  const [fetchError, setFetchError] = useState(false);
  const [bestDrop, setBestDrop] = useState<any>(null);
  const [bestPoll, setBestPoll] = useState<any>(null);
  const [copiedCreate, setCopiedCreate] = useState(false);

  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFetchingRef = useRef(false);
  const roomsRef = useRef<HTMLDivElement>(null);

  /* ── boot ── */
  useEffect(() => {
    const seen = sessionStorage.getItem('hasSeenIntro');
    if (!seen) setShowIntro(true);
    setSessionReady(true);
    const saved = JSON.parse(localStorage.getItem('savedRooms') || '[]');
    const av = parseInt(localStorage.getItem('avatarIndex') || '0');
    const seen2 = JSON.parse(localStorage.getItem('lastSeenMap') || '{}');
    setSavedIds(saved); setAvatarIndex(av); setLastSeenMap(seen2);
    const cached = localStorage.getItem("cachedRooms");
    if (cached) { try { setRooms(JSON.parse(cached)); setRoomsLoaded(true); } catch { } }
  }, []);

  const fetchRooms = useCallback(async (attempt = 0): Promise<void> => {
    if (isFetchingRef.current && attempt === 0) return;
    isFetchingRef.current = true;
    setFetchError(false);
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${BASE_URL}/api/rooms`, { signal: controller.signal });
      clearTimeout(tid);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRooms(data); setRoomsLoaded(true); setFetchError(false);
      localStorage.setItem("cachedRooms", JSON.stringify(data));
    } catch {
      clearTimeout(tid);
      if (attempt < 4) {
        retryTimeoutRef.current = setTimeout(() => fetchRooms(attempt + 1), (attempt + 1) * 2000);
      } else { setFetchError(true); setRoomsLoaded(true); }
    } finally { isFetchingRef.current = false; }
  }, []);

  const fetchBestContent = useCallback(async () => {
    try {
      const [dr, pr] = await Promise.all([
        fetch(`${BASE_URL}/api/today/best-drop`),
        fetch(`${BASE_URL}/api/today/best-poll`),
      ]);
      if (dr.ok) { const d = await dr.json(); setBestDrop(d); }
      if (pr.ok) { const p = await pr.json(); setBestPoll(p); }
    } catch { }
  }, []);

  useEffect(() => {
    if (!sessionReady) return;
    fetchRooms(); fetchBestContent();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    return () => { if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current); };
  }, [sessionReady, fetchRooms, fetchBestContent]);

  useEffect(() => {
    if (searchParams?.get('action') === 'create') {
      setTab('saved'); setTimeout(() => setShowAddModal(true), 300);
    }
  }, [searchParams]);

  useEffect(() => { setSearchOpen(false); setSearchQuery(""); }, [tab]);

  const handleCreateRoom = async () => {
    if (!newRoom.title.trim()) return alert("Title is required!");
    const res = await fetch(`${BASE_URL}/api/rooms`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newRoom),
    });
    if (!res.ok) return alert("Could not create room. Title may be taken.");
    const created = await res.json();
    const cs = JSON.parse(localStorage.getItem('savedRooms') || '[]');
    if (!cs.includes(created._id)) {
      const upd = [...cs, created._id]; setSavedIds(upd); localStorage.setItem('savedRooms', JSON.stringify(upd));
    }
    setNewRoom({ title: '', color: '#22c55e' }); setShowAddModal(false);
    fetchRooms(); setTab('saved');
  };

  const markRoomSeen = (roomId: string) => {
    const upd = { ...lastSeenMap, [roomId]: Date.now() };
    setLastSeenMap(upd); localStorage.setItem("lastSeenMap", JSON.stringify(upd));
  };

  const selectAvatar = (idx: number) => {
    setAvatarIndex(idx); localStorage.setItem('avatarIndex', idx.toString()); setShowAvatarModal(false);
  };

  const toggleSave = async (id: string) => {
    const isSaved = savedIds.includes(id);
    const ns = isSaved ? savedIds.filter(i => i !== id) : [...savedIds, id];
    setSavedIds(ns); localStorage.setItem("savedRooms", JSON.stringify(ns));
    setRooms(prev => prev.map(r => r._id === id ? { ...r, savedCount: Math.max(0, (r.savedCount || 0) + (isSaved ? -1 : 1)) } : r));
    try {
      await fetch(`${BASE_URL}/api/rooms/${id}/save`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isSaved ? "decrement" : "increment" }),
      });
      fetchRooms();
    } catch { setSavedIds(prev => isSaved ? [...prev, id] : prev.filter(i => i !== id)); }
  };

  const scrollToRooms = () => roomsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  /* ── swipe handler ──────────────────────────────────────
     Mental model — pages sit side by side:
       [saved]  |  [browse]  |  [/intro route]

     Swipe RIGHT (offset.x > 0, finger drags right):
       Move forward → saved → browse → /intro

     Swipe LEFT  (offset.x < 0, finger drags left):
       Move back   → browse → saved
  ─────────────────────────────────────────────────────── */
  const handleSwipe = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const { offset, velocity } = info;
    const isSwipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 300;
    if (!isSwipe) return;

    if (offset.x > 0) {
      // finger dragged RIGHT → go forward: saved → browse → /intro
      if (tab === 'saved') setTab('browse');
      else if (tab === 'browse') router.push('/intro');
    } else {
      // finger dragged LEFT → go back: browse → saved
      if (tab === 'browse') setTab('saved');
    }
  };

  const filtered = rooms
    .filter(r => tab === 'saved' ? savedIds.includes(r._id) : true)
    .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => tab === 'saved' ? new Date(b.lastDropAt).getTime() - new Date(a.lastDropAt).getTime() : 0);

  if (!sessionReady) return null;
  if (showIntro) return <IntroScreen onFinish={() => { sessionStorage.setItem('hasSeenIntro', 'true'); setShowIntro(false); }} />;

  return (
    <main className="w-full max-w-md mx-auto min-h-screen pb-28 relative select-none overflow-x-hidden">

      {/* ── HEADER ── */}
      <header className="pt-10 px-4 flex justify-center">
        <h1 className="text-3xl font-black tracking-tighter text-center">
          B<span className="mirror">L</span>ACK BOX
        </h1>
      </header>

      {/* ── CAPSULE NAV ── */}
      <div className="flex justify-center items-center gap-3 mt-5 px-4">
        {/* left circle → /intro */}
        <Link href="/intro">
          <motion.div
            whileTap={{ scale: 0.88 }}
            className="w-10 h-10 rounded-full border border-white/20 bg-[#1a1a1a] flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ boxShadow: '0 0 14px rgba(250,201,246,0.12)' }}
          >
            <Image
              src="/logo 2.png"
              alt="BlackBox"
              width={26}
              height={26}
              className="object-contain"
              style={{ mixBlendMode: 'screen' }}
            />
          </motion.div>
        </Link>

        {/* center pill */}
        <div
          className="relative flex items-center bg-[#111] border border-white/10 rounded-full p-1 flex-1 max-w-[220px]"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)' }}
        >
          <motion.div
            className="absolute top-1 bottom-1 rounded-full bg-white/10"
            animate={{ left: tab === 'browse' ? 4 : '50%', width: 'calc(50% - 4px)' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          />
          <button
            onClick={() => setTab('browse')}
            className={`relative z-10 flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-full transition-colors duration-200 ${tab === 'browse' ? 'text-[#fac9f6]' : 'text-white/40'}`}
          >
            Browse
          </button>
          <button
            onClick={() => setTab('saved')}
            className={`relative z-10 flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-full transition-colors duration-200 ${tab === 'saved' ? 'text-[#fac9f6]' : 'text-white/40'}`}
          >
            Saved
          </button>
        </div>

        {/* right circle → /game */}
        <Link href="/game">
          <motion.div
            whileTap={{ scale: 0.88 }}
            className="w-10 h-10 rounded-full border border-white/20 bg-[#1a1a1a] flex items-center justify-center overflow-hidden flex-shrink-0"
          >
            <Image
              src="/logo 3.png"
              alt="Game"
              width={22}
              height={22}
              className="object-contain opacity-70"
              style={{ mixBlendMode: 'screen' }}
            />
          </motion.div>
        </Link>
      </div>

      {/* ── SWIPE CONTAINER ── */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleSwipe}
        className="touch-pan-y w-full"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ x: tab === 'browse' ? 60 : -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: tab === 'browse' ? -60 : 60, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full"
          >

            {/* ══ SAVED TAB ══ */}
            {tab === 'saved' && (
              <div className="px-4 mt-7 flex flex-col items-center gap-5">
                {/* avatar */}
                <div className="flex flex-col items-center">
                  <div
                    onClick={() => setShowAvatarModal(true)}
                    className="w-20 h-20 rounded-full border-4 border-[#fac9f6] p-1 cursor-pointer active:scale-95 transition-transform"
                    style={{ boxShadow: '0 0 18px rgba(250,201,246,0.25)' }}
                  >
                    <img src={`/avatars/${avatarIndex}.png`} className="w-full h-full rounded-full object-cover" alt="Avatar" />
                  </div>
                  <button onClick={() => setShowAvatarModal(true)} className="mt-1.5 text-[9px] font-black uppercase text-white/30 tracking-widest">
                    Edit Bitmoji
                  </button>
                </div>

                {/* search */}
                <div className={`flex items-center w-full h-11 bg-white/5 rounded-2xl border border-white/10 transition-all duration-300 ${searchOpen ? 'ring-1 ring-[#fac9f6]/30 bg-white/10' : ''}`}>
                  <button onClick={() => setSearchOpen(p => !p)} className="w-11 h-full flex items-center justify-center shrink-0">
                    <Search size={16} className={searchOpen ? 'text-[#fac9f6]' : 'text-white/40'} />
                  </button>
                  <AnimatePresence>
                    {searchOpen && (
                      <motion.input
                        initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                        autoFocus
                        className="flex-1 pr-4 outline-none text-sm bg-transparent text-white placeholder:text-white/20 font-medium min-w-0"
                        placeholder="Search saved rooms..."
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* ══ BROWSE TAB ══ */}
            {tab === 'browse' && (
              <div className="mt-5">
                {/* controls row */}
                <div className="px-4 flex items-center gap-2 h-11">
                  <button
                    onClick={scrollToRooms}
                    className="flex items-center gap-1.5 border border-white/10 bg-white/5 active:bg-white/10 px-3 h-full rounded-2xl text-[10px] font-black uppercase shrink-0 transition-all"
                  >
                    <Flame size={11} className="text-[#fac9f6]" fill="#fac9f6" />
                    {!searchOpen && <span>Trending</span>}
                  </button>
                  <div className={`flex items-center h-full flex-1 bg-white/5 rounded-2xl border border-white/10 transition-all duration-300 ${searchOpen ? 'ring-1 ring-[#fac9f6]/30 bg-white/10' : ''}`}>
                    <button onClick={() => setSearchOpen(p => !p)} className="w-11 h-full flex items-center justify-center shrink-0">
                      <Search size={16} className={searchOpen ? 'text-[#fac9f6]' : 'text-white/40'} />
                    </button>
                    <AnimatePresence>
                      {searchOpen && (
                        <motion.input
                          initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                          autoFocus
                          className="flex-1 pr-3 outline-none text-sm bg-transparent text-white placeholder:text-white/20 font-medium min-w-0"
                          placeholder="Find a vibe..."
                          onChange={e => setSearchQuery(e.target.value)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* blurb */}
                <div className="px-4 mt-4">
                  <AnimatedBlurb />
                </div>

                {/* TODAY'S BEST DROP */}
                {bestDrop?.drop && (
                  <div className="px-4 mt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">Today's Best Drop</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                    {bestDrop.room && (
                      <Link href={`/room/${bestDrop.room.slug}`} className="flex items-center gap-2 mb-2 px-1">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: bestDrop.room.color }} />
                        <span className="text-[10px] font-black uppercase text-white/35 tracking-widest truncate">{bestDrop.room.title}</span>
                        <ChevronRight size={9} className="text-white/20 flex-shrink-0" />
                      </Link>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                      className="rounded-2xl border border-white/10 p-4 relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${bestDrop.room?.color || '#fac9f6'}10 0%, #0a0a0a 100%)`,
                        borderLeft: `3px solid ${bestDrop.room?.color || '#fac9f6'}40`,
                      }}
                    >
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                        <span className="text-[8px]">🏆</span>
                        <span className="text-[8px] font-black uppercase text-white/40">Top Drop</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <img src={`/avatars/${bestDrop.drop.avatarIndex ?? 0}.png`} className="w-8 h-8 rounded-full border border-white/20 flex-shrink-0" alt="" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-black uppercase text-white/70 truncate">{bestDrop.drop.tempName || "Anonymous"}</p>
                          <p className="text-[8px] text-white/25 font-bold uppercase">{formatTime(bestDrop.drop.createdAt)}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-white/80 leading-relaxed mb-3 line-clamp-4">{bestDrop.drop.content}</p>
                      <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                        <span className="flex items-center gap-1 text-[11px] font-black text-white/50"><Heart size={10} fill="currentColor" /> {bestDrop.drop.likes?.length || 0}</span>
                        <span className="flex items-center gap-1 text-[11px] font-black text-white/35"><ThumbsDown size={10} /> {bestDrop.drop.dislikes?.length || 0}</span>
                        {(bestDrop.drop.replies?.length || 0) > 0 && <span className="text-[9px] text-white/25 font-bold">{bestDrop.drop.replies.length} subdrops</span>}
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* TODAY'S BEST POLL */}
                {bestPoll?.poll && (
                  <div className="px-4 mt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">Today's Top Poll</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                    {bestPoll.room && (
                      <Link href={`/room/${bestPoll.room.slug}`} className="flex items-center gap-2 mb-2 px-1">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: bestPoll.room.color }} />
                        <span className="text-[10px] font-black uppercase text-white/35 tracking-widest truncate">{bestPoll.room.title}</span>
                        <ChevronRight size={9} className="text-white/20 flex-shrink-0" />
                      </Link>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
                      className="rounded-2xl border border-white/10 p-4 relative"
                      style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.07) 0%, #0a0a0a 100%)', borderLeft: '3px solid rgba(167,139,250,0.35)' }}
                    >
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                        <BarChart2 size={8} className="text-[#a78bfa]" />
                        <span className="text-[8px] font-black uppercase text-white/40">Top Poll</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <img src={`/avatars/${bestPoll.poll.avatarIndex ?? 0}.png`} className="w-8 h-8 rounded-full border border-white/20 flex-shrink-0" alt="" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-black uppercase text-white/70 truncate">{bestPoll.poll.tempName || "Anonymous"}</p>
                          <p className="text-[8px] text-white/25 font-bold uppercase">{formatTime(bestPoll.poll.createdAt)}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-white/85 mb-3">{bestPoll.poll.question}</p>
                      <div className="flex flex-col gap-1.5">
                        {bestPoll.poll.options?.map((opt: any, i: number) => {
                          const tv = bestPoll.poll.options.reduce((s: number, o: any) => s + o.voters.length, 0);
                          const pct = tv > 0 ? Math.round((opt.voters.length / tv) * 100) : 0;
                          return (
                            <div key={i} className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                              <div className="absolute inset-y-0 left-0 rounded-xl" style={{ width: `${pct}%`, background: 'rgba(167,139,250,0.2)', transition: 'width 1s ease' }} />
                              <div className="relative px-3 py-2 flex justify-between items-center">
                                <span className="text-[11px] font-medium text-white/75 truncate pr-2">{opt.text}</span>
                                <span className="text-[9px] font-black text-white/35 flex-shrink-0">{pct}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Users size={10} className="text-white/25" />
                        <span className="text-[9px] text-white/25 font-bold">
                          {bestPoll.poll.options?.reduce((s: number, o: any) => s + o.voters.length, 0)} votes
                        </span>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            )}

            {/* ══ ROOM GRID ══ */}
            <div ref={roomsRef} className="px-4 mt-6 grid grid-cols-2 gap-4 pb-24">
              {tab === 'browse' && (
                <div className="col-span-2 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">All Rooms</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
              )}

              {fetchError && rooms.length === 0 && (
                <div className="col-span-2 flex flex-col items-center gap-3 py-10">
                  <p className="text-white/30 text-xs font-black uppercase tracking-widest">Connection issue</p>
                  <button onClick={() => fetchRooms(0)} className="text-[#fac9f6] text-xs font-black uppercase border border-[#fac9f6]/30 px-4 py-2 rounded-full">
                    Tap to retry
                  </button>
                </div>
              )}

              {!roomsLoaded && !fetchError && [...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square rounded-[2rem] bg-white/5 border border-white/10 animate-pulse" />
              ))}

              {roomsLoaded && filtered.map((room: any) => {
                const lastSeen = lastSeenMap[room._id] || 0;
                const hasNew = new Date(room.lastDropAt).getTime() > lastSeen;
                return (
                  <div key={room._id} className="relative">
                    {tab === 'saved' && hasNew && <div className="dot-badge">!</div>}
                    <RoomTile
                      room={room}
                      isSaved={savedIds.includes(room._id)}
                      onSave={() => toggleSave(room._id)}
                      onOpen={() => markRoomSeen(room._id)}
                    />
                  </div>
                );
              })}

              {roomsLoaded && tab === 'saved' && filtered.length === 0 && !fetchError && (
                <div className="col-span-2 flex flex-col items-center gap-2 py-10">
                  <p className="text-white/20 text-xs font-black uppercase tracking-widest">No saved rooms yet</p>
                  <button onClick={() => setTab('browse')} className="text-[#fac9f6] text-xs font-black uppercase mt-1">
                    Browse rooms →
                  </button>
                </div>
              )}
            </div>

          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── FAB (saved tab only) ── */}
      <AnimatePresence>
        {tab === 'saved' && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setShowAddModal(true)}
            className="fixed bottom-7 right-5 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl z-50 border border-white/10"
          >
            <Plus size={26} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── CREATE ROOM MODAL ── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-end justify-center p-0"
            onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-[#0a0a0a] w-full max-w-md rounded-t-[2rem] px-5 pt-5 pb-10 border-t border-x border-white/10 relative shadow-2xl"
            >
              {/* drag handle */}
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
              <button onClick={() => setShowAddModal(false)} className="absolute top-5 right-5 text-white/40 p-1"><X size={20} /></button>
              <h2 className="text-xl font-black italic uppercase mb-5">Create Room</h2>

              <label className="text-[10px] font-black uppercase text-white/40 mb-1.5 block">Room Title</label>
              <input
                className="w-full border border-white/10 bg-black p-3.5 rounded-2xl mb-5 outline-none font-bold text-white placeholder:text-white/30 text-sm"
                placeholder="E.g. Library Gossips"
                value={newRoom.title}
                onChange={e => setNewRoom({ ...newRoom, title: e.target.value })}
              />

              <label className="text-[10px] font-black uppercase text-white/40 mb-1.5 block">Theme Color</label>
              <input type="color" className="w-full h-11 rounded-xl mb-5 cursor-pointer" value={newRoom.color} onChange={e => setNewRoom({ ...newRoom, color: e.target.value })} />

              <p className="text-red-500 text-[10px] font-black uppercase mb-1">Don't forget to copy the link</p>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-3 rounded-xl mb-5">
                <span className="text-[10px] text-white/50 font-mono truncate flex-1">
                  blackbox-omega-peach.vercel.app/room/{newRoom.title.toLowerCase().replace(/ /g, '-')}
                </span>
                <button onClick={() => {
                  navigator.clipboard.writeText(`blackbox-omega-peach.vercel.app/room/${newRoom.title.toLowerCase().replace(/ /g, '-')}`);
                  setCopiedCreate(true); setTimeout(() => setCopiedCreate(false), 2000);
                }} className="shrink-0 p-1">
                  {copiedCreate ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-white/40" />}
                </button>
              </div>

              <button onClick={handleCreateRoom} className="w-full bg-white text-black py-3.5 rounded-2xl font-black uppercase tracking-widest text-sm active:scale-95 transition-all">
                Create
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AVATAR MODAL ── */}
      <AnimatePresence>
        {showAvatarModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-end justify-center p-0"
            onClick={(e) => { if (e.target === e.currentTarget) setShowAvatarModal(false); }}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-md rounded-t-[2rem] px-5 pt-5 pb-10 border-t border-x border-white/10 max-h-[75vh] overflow-y-auto bg-[#0a0a0a]"
            >
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-black uppercase italic">Pick Your Bitmoji</h2>
                <button onClick={() => setShowAvatarModal(false)} className="text-white/40 p-1"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[...Array(19)].map((_, i) => (
                  <div key={i} onClick={() => selectAvatar(i)}
                    className={`aspect-square rounded-full border-2 p-1 cursor-pointer transition-all active:scale-90 ${avatarIndex === i ? 'border-[#fac9f6] scale-110' : 'border-white/10'}`}>
                    <img src={`/avatars/${i}.png`} className="w-full h-full rounded-full object-cover" alt="" />
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

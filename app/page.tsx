"use client";
import { useState, useEffect } from 'react';
import { Search, Flame, Plus, X, Copy, Check, User, ShieldCheck } from 'lucide-react';
import { FaInstagram, FaLinkedin } from 'react-icons/fa';
import RoomTile from '@/components/RoomTile';
import IntroScreen from "@/components/IntroScreen";
import WarningModal from "@/components/WarningModal";
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [showIntro, setShowIntro] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [tab, setTab] = useState<'browse' | 'saved'>('saved');
  const [rooms, setRooms] = useState([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [lastSeenMap, setLastSeenMap] = useState<any>({});
  const [showMeModal, setShowMeModal] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ title: '', color: '#22c55e' });

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const hasSeenIntroValue = sessionStorage.getItem('hasSeenIntro');
    const hasAgreedValue = sessionStorage.getItem('hasAgreed');
    setShowIntro(hasSeenIntroValue !== 'true');
    setAgreed(hasAgreedValue === 'true');
    setIsCheckingSession(false);

    const saved = JSON.parse(localStorage.getItem('savedRooms') || '[]');
    const av = localStorage.getItem('avatarIndex') || '0';
    const seen = JSON.parse(localStorage.getItem('lastSeenMap') || '{}');
    setLastSeenMap(seen);
    setSavedIds(saved);
    setAvatarIndex(parseInt(av));

    const cached = localStorage.getItem("cachedRooms");
    if (cached) setRooms(JSON.parse(cached));
    fetchRooms();

    // ── REGISTER SERVICE WORKER ──────────────────────────────
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('SW registered:', reg.scope);
      }).catch((err) => {
        console.error('SW registration failed:', err);
      });
    }
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/rooms`);
      const data = await res.json();
      setRooms(data);
      localStorage.setItem("cachedRooms", JSON.stringify(data));
    } catch (err) {
      console.error("Fetch rooms failed:", err);
    }
  };

  // ── REQUEST PUSH NOTIFICATION PERMISSION ────────────────────
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  // ── CREATE ROOM + AUTO-SAVE ──────────────────────────────────
  const handleCreateRoom = async () => {
    if (!newRoom.title.trim()) return alert("Title is required!");

    const res = await fetch(`${BASE_URL}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRoom)
    });

    if (!res.ok) return alert("Could not create room. Title may be taken.");

    const created = await res.json();

    // ✅ Auto-save the newly created room for this user
    const currentSaved = JSON.parse(localStorage.getItem('savedRooms') || '[]');
    if (!currentSaved.includes(created._id)) {
      const updated = [...currentSaved, created._id];
      setSavedIds(updated);
      localStorage.setItem('savedRooms', JSON.stringify(updated));
    }

    setNewRoom({ title: '', color: '#22c55e' });
    setShowAddModal(false);
    fetchRooms();

    // Switch to saved tab so they see their new room immediately
    setTab('saved');
  };

  const markRoomSeen = (roomId: string) => {
    const updated = { ...lastSeenMap, [roomId]: Date.now() };
    setLastSeenMap(updated);
    localStorage.setItem("lastSeenMap", JSON.stringify(updated));
  };

  const selectAvatar = (idx: number) => {
    setAvatarIndex(idx);
    localStorage.setItem('avatarIndex', idx.toString());
    setShowAvatarModal(false);
  };

  const filtered = rooms
    .filter((r: any) => tab === 'saved' ? savedIds.includes(r._id) : true)
    .filter((r: any) => r.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const toggleSave = async (id: string) => {
    const isSaved = savedIds.includes(id);
    const newSaved = isSaved ? savedIds.filter(i => i !== id) : [...savedIds, id];
    setSavedIds(newSaved);
    localStorage.setItem("savedRooms", JSON.stringify(newSaved));
    await fetch(`${BASE_URL}/api/rooms/${id}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: isSaved ? "decrement" : "increment" })
    });
    fetchRooms();
  };

  if (isCheckingSession) return null;

  if (showIntro) {
    return (
      <IntroScreen
        onFinish={() => {
          sessionStorage.setItem('hasSeenIntro', 'true');
          setShowIntro(false);
          // Ask for notification permission after intro
          requestNotificationPermission();
        }}
      />
    );
  }

  return (
    <>
      {!agreed && (
        <WarningModal
          onAgree={() => {
            sessionStorage.setItem('hasAgreed', 'true');
            setAgreed(true);
            requestNotificationPermission();
          }}
        />
      )}

      <main className={`${!agreed ? "blur-md pointer-events-none" : ""} max-w-md mx-auto min-h-screen pb-24 relative`}>
        <header className="pt-8 px-6 flex justify-center">
          <h1 className="text-3xl font-black tracking-tighter text-center">
            B<span className="mirror">L</span>ACK BOX
          </h1>
        </header>

        {/* CAPSULE NAV */}
        <div className="flex justify-center mt-6">
  <div className="bg-white/5 border-white/10 p-1 rounded-full flex w-64 relative border capsule-shadow">
    {/* Updated the background slider to a subtle pinkish glow if you like, or kept it white/10 */}
    <div className={`absolute top-1 bottom-1 w-[124px] bg-white/10 rounded-full transition-all duration-300 ${tab === 'saved' ? 'translate-x-[126px]' : 'translate-x-0'}`} />
    
    <button 
      onClick={() => setTab('browse')} 
      className={`flex-1 py-2 z-10 font-black text-xs uppercase transition-colors duration-300 ${tab === 'browse' ? 'text-[#fac9f6]' : 'text-white/40'}`}
    >
      Browse
    </button>
    <button 
      onClick={() => setTab('saved')} 
      className={`flex-1 py-2 z-10 font-black text-xs uppercase transition-colors duration-300 ${tab === 'saved' ? 'text-[#fac9f6]' : 'text-white/40'}`}
    >
      Saved
    </button>
  </div>
</div>

        <div className="relative flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ x: tab === 'saved' ? 50 : -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: tab === 'saved' ? -50 : 50, opacity: 0 }}
              transition={{ duration: 0.2 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, { offset }) => {
                if (offset.x > 50 && tab === 'saved') setTab('browse');
                else if (offset.x < -50 && tab === 'browse') setTab('saved');
              }}
              className="min-h-[500px] touch-pan-y"
            >

              {/* SAVED TAB: AVATAR */}
              {tab === 'saved' && (
        <div className="mt-8 px-6 flex flex-col items-center">
          <div onClick={() => setShowAvatarModal(true)} className="w-24 h-24 rounded-full border-4 border-[#fac9f6] p-1 cursor-pointer hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,169,248,0.3)]">
            <img src={`/avatars/${avatarIndex}.png`} className="w-full h-full rounded-full object-cover" alt="Avatar" />
          </div>
          <button onClick={() => setShowAvatarModal(true)} className="mt-3 text-[10px] font-black uppercase text-white/40 tracking-widest">Edit Bitmoji</button>
        </div>
      )}

              {/* BROWSE TAB: CONTROLS - Fixed Layout Shift */}
{tab === 'browse' && (
  <div className="px-6 mt-8 flex items-center justify-between gap-3 h-12 relative">
    <div className="flex items-center gap-2 flex-1 h-full">
      {/* Trending Button - Size remains constant */}
      <button className="flex items-center gap-1 border border-white/10 bg-white/5 hover:bg-white/10 text-white px-4 h-full rounded-2xl text-[10px] font-black uppercase shrink-0 transition-all">
        <Flame size={12} className="text-[#fac9f6]" fill="#fac9f6" /> 
        {!searchOpen && <span>Trending</span>}
      </button>
      
      {/* FANCY SEARCH BAR - Uses flex-grow without breaking layout */}
      <div className={`flex items-center h-full transition-all duration-500 ease-out bg-white/5 rounded-2xl border border-white/10 hover:border-[#fac9f6]/50 ${searchOpen ? 'flex-1 ring-1 ring-[#fac9f6]/30 bg-white/10' : 'w-12'}`}>
        <button 
          onClick={() => setSearchOpen(!searchOpen)} 
          className="w-12 h-full flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Search size={18} className={`${searchOpen ? 'text-[#fac9f6]' : 'text-white/60'} transition-colors`} />
        </button>
        
        <AnimatePresence>
          {searchOpen && (
            <motion.input
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              autoFocus
              className="flex-1 pr-4 outline-none text-sm bg-transparent text-white placeholder:text-white/20 font-medium min-w-0"
              placeholder="Find a vibe..."
              onChange={e => setSearchQuery(e.target.value)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>

    {/* PINK USER LOGO - Positioned to stay put */}
    <button 
      onClick={() => setShowMeModal(true)} 
      className="h-12 w-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl shrink-0 hover:bg-white/10 transition-all active:scale-90"
    >
      <User size={20} style={{ color: '#fac9f6' }} />
    </button>
  </div>
)}

              {/* ROOM GRID */}
              <div className="px-6 mt-8 grid grid-cols-2 gap-6 pb-20 grid-auto-rows-[1fr]">
                {filtered.length === 0 ? (
                  [...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-[2.5rem] bg-white/5 border border-white/10 animate-pulse" />
                  ))
                ) : (
                  filtered.map((room: any) => {
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
                  })
                )}
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* FAB */}
        <button onClick={() => setShowAddModal(true)} className="fixed bottom-8 right-8 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl z-50">
          <Plus size={28} />
        </button>

        {/* MODAL: CREATE ROOM */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <div className="bg-[#0a0a0a] border-white/10 w-full rounded-[2.5rem] p-8 border-2 relative">
              <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6"><X /></button>
              <h2 className="text-2xl font-black italic uppercase mb-6">Create Room</h2>

              <label className="text-[10px] font-black uppercase text-white/40 mb-2 block">Room Title</label>
              <input
                className="w-full border-2 border-black p-4 rounded-2xl mb-6 outline-none font-bold bg-black text-white placeholder:text-white/30"
                placeholder="E.g. Library Gossips"
                value={newRoom.title}
                onChange={e => setNewRoom({ ...newRoom, title: e.target.value })}
              />

              <label className="text-[10px] font-black uppercase text-white/40 mb-2 block">Theme Color</label>
              <input
                type="color"
                className="w-full h-12 rounded-xl mb-6 cursor-pointer"
                value={newRoom.color}
                onChange={e => setNewRoom({ ...newRoom, color: e.target.value })}
              />

              <p className="text-red-500 text-[10px] font-black uppercase mb-1">Do not forget to copy the link</p>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-4 rounded-xl mb-8">
                <span className="text-[10px] text-white/70 font-mono truncate flex-1">
                  blackbox-omega-peach.vercel.app/room/{newRoom.title.toLowerCase().replace(/ /g, '-')}
                </span>
                <Copy
                  size={16}
                  className="cursor-pointer shrink-0"
                  onClick={() => {
                    const roomSlug = newRoom.title.toLowerCase().replace(/ /g, '-');
                    navigator.clipboard.writeText(`blackbox-omega-peach.vercel.app/room/${roomSlug}`);
                    alert("Link copied!");
                  }}
                />
              </div>

              <button onClick={handleCreateRoom} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-200 active:scale-95 transition-all">
                Create
              </button>
            </div>
          </div>
        )}

        {/* MODAL: AVATAR PICKER */}
        {showAvatarModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <div className="w-full rounded-[2.5rem] p-8 border-2 border-black max-h-[80vh] overflow-y-auto bg-[#0a0a0a]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase italic">Pick Your Bitmoji</h2>
                <button onClick={() => setShowAvatarModal(false)}><X /></button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[...Array(19)].map((_, i) => (
                  <div
                    key={i}
                    onClick={() => selectAvatar(i)}
                    className={`aspect-square rounded-full border-2 p-1 cursor-pointer transition-all ${avatarIndex === i ? 'border-green-500 bg-green-50 scale-110' : 'border-white/10 hover:border-white'}`}
                  >
                    <img src={`/avatars/${i}.png`} className="w-full h-full rounded-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODAL: DEVELOPER PROFILE */}
        <AnimatePresence>
          {showMeModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[150] flex items-center justify-center p-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-[#0a0a0a] border border-white/10 w-full max-w-sm rounded-[3rem] overflow-hidden relative shadow-[0_0_50px_rgba(34,197,94,0.15)]"
              >
                <button
                  onClick={() => setShowMeModal(false)}
                  className="absolute top-6 right-6 z-10 p-2 bg-black/50 rounded-full text-white/50 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center p-8">
                  <motion.div
                    initial={{ rotate: -10, scale: 0.5 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="relative w-32 h-32 mb-6"
                  >
                    <div className="absolute inset-0 bg-green-500 rounded-[2.5rem] blur-2xl opacity-20 animate-pulse"></div>
                    <img
                      src="/me.jpeg"
                      alt="Daksh Vasani"
                      className="w-full h-full object-cover rounded-[2.5rem] border-2 border-green-500 relative z-10"
                    />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white mb-1">Daksh Vasani</h2>
                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-[0.3em] mb-6">Founder & Architect</p>
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-4 mb-8">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-3 text-left">
                      <ShieldCheck className="text-green-500 shrink-0" size={20} />
                      <div>
                        <p className="text-[11px] font-black uppercase text-white/90 leading-tight">Anonymous & Safe</p>
                        <p className="text-[9px] text-white/40 mt-1 leading-relaxed">Built to let students voice out without fear. Our AI filters block toxicity in real-time before it hits the feed.</p>
                      </div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 120 }}
                      className="relative w-full h-40 rounded-3xl overflow-hidden border border-white/10"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-purple-500/20 to-pink-500/20 blur-2xl animate-pulse"></div>
                      <motion.img
                        src="/censor.png"
                        alt="Censorship Visual"
                        className="w-full h-full object-cover relative z-10"
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.4 }}
                      />
                      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-20"></div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="absolute bottom-3 left-4 z-30"
                      >
                        <p className="text-[10px] font-black uppercase text-white/80 tracking-widest">AI MODERATION ACTIVE</p>
                        <p className="text-[8px] text-white/40">Real-time censorship engine</p>
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  <div className="flex gap-3 w-full">
                    <motion.a
                      whileHover={{ y: -4 }}
                      href="https://www.linkedin.com/in/daksh-vasani/" target="_blank"
                      className="flex-1 flex items-center justify-center gap-2 p-4 bg-[#0077b5]/10 border border-[#0077b5]/20 rounded-2xl text-[#0077b5]"
                    >
                      <FaLinkedin size={18} />
                    </motion.a>
                    <motion.a
                      whileHover={{ y: -4 }}
                      href="https://www.instagram.com/wasitreallydaksh" target="_blank"
                      className="flex-1 flex items-center justify-center gap-2 p-4 bg-pink-500/10 border border-pink-500/20 rounded-2xl text-pink-500"
                    >
                      <FaInstagram size={18} />
                    </motion.a>
                  </div>

                  <p className="mt-8 text-[8px] font-black text-white/20 uppercase tracking-widest">© 2026 Black Box Protocol</p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}

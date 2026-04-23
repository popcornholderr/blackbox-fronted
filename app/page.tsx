"use client";
import { useState, useEffect } from 'react';
import { Search, Flame, Plus, X, Copy, Check, Bookmark, ArrowLeft } from 'lucide-react';
import RoomTile from '@/components/RoomTile';
import IntroScreen from "@/components/IntroScreen";
import WarningModal from "@/components/WarningModal";

export default function Home() {
  const [showIntro, setShowIntro] = useState(false); // Start as false to prevent flicker
const [isCheckingSession, setIsCheckingSession] = useState(true);
const [agreed, setAgreed] = useState(false);
  const [tab, setTab] = useState<'browse' | 'saved'>('saved');
  const [rooms, setRooms] = useState([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [lastSeenMap, setLastSeenMap] = useState<any>({});

  const [introType, setIntroType] = useState<'full' | 'back' | 'none'>('none');
  
  // Search States
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ title: '', color: '#22c55e' });
  
  useEffect(() => {
    // 1. Check if the user has already seen the intro in THIS session
   const hasSeenIntroValue = sessionStorage.getItem('hasSeenIntro');
  const hasAgreedValue = sessionStorage.getItem('hasAgreed');
    
  setShowIntro(hasSeenIntroValue !== 'true'); 
  setAgreed(hasAgreedValue === 'true')

   
    setIsCheckingSession(false);

    const saved = JSON.parse(localStorage.getItem('savedRooms') || '[]');
    const av = localStorage.getItem('avatarIndex') || '0';
    const seen = JSON.parse(localStorage.getItem('lastSeenMap') || '{}');
  setLastSeenMap(seen);
    setSavedIds(saved);
    setAvatarIndex(parseInt(av));
    fetchRooms();
  }, []);


  
  const fetchRooms = () => {
    fetch('http://localhost:5000/api/rooms').then(res => res.json()).then(setRooms);
  };

  const handleCreateRoom = async () => {
    if (!newRoom.title) return alert("Title is required!");
    await fetch('http://localhost:5000/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRoom)
    });
    setNewRoom({ title: '', color: '#22c55e' });
    setShowAddModal(false);
    fetchRooms();
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

  const newSaved = isSaved
    ? savedIds.filter(i => i !== id)
    : [...savedIds, id];

  setSavedIds(newSaved);
  localStorage.setItem("savedRooms", JSON.stringify(newSaved));

  await fetch(`http://localhost:5000/api/rooms/${id}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: isSaved ? "decrement" : "increment"
    })
  });

  fetchRooms();
};

if (isCheckingSession) return null; // Or a loading spinner

if (showIntro) {
  return (
    <IntroScreen 
      onFinish={() => {
        sessionStorage.setItem('hasSeenIntro', 'true'); // Save the state
        setShowIntro(false);
      }} 
    />
  );
}
return(
  <>
    {!agreed && (
  <WarningModal 
    onAgree={() => {
      sessionStorage.setItem('hasAgreed', 'true'); // Save agreement for this session
      setAgreed(true);
    }} 
  />
)}

    <main className={`${!agreed ? "blur-md pointer-events-none" : ""} max-w-md mx-auto min-h-screen bg-white pb-24 relative`}>
     <header className="pt-8 px-6 flex justify-center">
  <h1 className="text-3xl font-black tracking-tighter text-center">
  B<span className="mirror">L</span>ACK BOX
</h1>
</header>

      {/* CAPSULE NAV */}
      <div className="flex justify-center mt-6">
        <div className="bg-gray-100 p-1 rounded-full flex w-64 relative border border-gray-200 capsule-shadow">
          <div className={`absolute top-1 bottom-1 w-[124px] bg-white rounded-full transition-all duration-300 ${tab === 'saved' ? 'translate-x-[126px]' : 'translate-x-0'}`} />
          <button onClick={() => setTab('browse')} className={`flex-1 py-2 z-10 font-black text-xs uppercase ${tab === 'browse' ? 'text-green-500' : 'text-gray-400'}`}>Browse</button>
          <button onClick={() => setTab('saved')} className={`flex-1 py-2 z-10 font-black text-xs uppercase ${tab === 'saved' ? 'text-green-500' : 'text-gray-400'}`}>Saved</button>
        </div>
      </div>

      {/* SAVED PAGE: AVATAR SECTION */}
      {tab === 'saved' && (
        <div className="mt-8 px-6 flex flex-col items-center">
          <div onClick={() => setShowAvatarModal(true)} className="w-24 h-24 rounded-full border-4 border-green-500 p-1 cursor-pointer hover:scale-105 transition-transform">
            <img src={`/avatars/${avatarIndex}.png`} className="w-full h-full rounded-full object-cover" />
          </div>
          <button onClick={() => setShowAvatarModal(true)} className="mt-3 text-[10px] font-black uppercase text-gray-400 tracking-widest">Edit Bitmoji</button>
        </div>
      )}

      {/* BROWSE PAGE: LEFT-ALIGNED CONTROLS */}
      {tab === 'browse' && (
        <div className="px-6 mt-8 flex items-center justify-start gap-2">
          <button className="flex items-center gap-1 border-2 border-black bg-black text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase">
            <Flame size={12} fill="white" /> Trending
          </button>
          <div className={`flex items-center transition-all duration-500 overflow-hidden ${searchOpen ? 'flex-1 border-b-2 border-black' : 'w-11'}`}>
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 border-2 border-black rounded-xl shrink-0">
              <Search size={16} />
            </button>
            <input 
              className="flex-1 px-2 outline-none text-sm bg-transparent" 
              placeholder="Search rooms..." 
              onChange={e => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>
      )}

      {/* GRID */}
      <div className="px-6 mt-8 grid grid-cols-2 gap-6">
  {filtered.map((room: any) => {

  const lastSeen = lastSeenMap[room._id] || 0;

  const hasNew = new Date(room.lastDropAt).getTime() > lastSeen;

  return (
    <div key={room._id} className="relative">

      {/* ✅ REPLACE OLD STATIC DOT */}
      {tab === 'saved' && hasNew && (
        <div className="dot-badge">!</div>
      )}

        <RoomTile 
          room={room} 
          isSaved={savedIds.includes(room._id)} 
          onSave={() => toggleSave(room._id)} 
          onOpen={() => markRoomSeen(room._id)}
        />

      </div>
    );
  })}
</div>

      {/* FLOATING ADD BUTTON */}
      <button onClick={() => setShowAddModal(true)} className="fixed bottom-8 right-8 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl z-50">
        <Plus size={28} />
      </button>

      {/* MODAL: ADD ROOM */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full rounded-[2.5rem] p-8 border-2 border-black relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6"><X /></button>
            <h2 className="text-2xl font-black italic uppercase mb-6">Create Room</h2>
            
            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Room Title</label>
            <input 
              className="w-full border-2 border-black p-4 rounded-2xl mb-6 outline-none font-bold" 
              placeholder="E.g. Library Gossips"
              onChange={e => setNewRoom({...newRoom, title: e.target.value})}
            />

            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Theme Color</label>
            <input 
              type="color" 
              className="w-full h-12 rounded-xl mb-6 cursor-pointer"
              value={newRoom.color}
              onChange={e => setNewRoom({...newRoom, color: e.target.value})}
            />

            <p className="text-red-500 text-[10px] font-black uppercase mb-1">Do not forget to copy the link</p>
            <div className="flex items-center gap-2 bg-gray-100 p-4 rounded-xl mb-8">
              <span className="text-[10px] font-mono truncate flex-1">dropgallery.com/room/{newRoom.title.toLowerCase().replace(/ /g, '-')}</span>
              <Copy size={16} className="cursor-pointer" onClick={() => navigator.clipboard.writeText(`dropgallery.com/room/${newRoom.title.toLowerCase().replace(/ /g, '-')}`)} />
            </div>

            <button onClick={handleCreateRoom} className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest">Create</button>
          </div>
        </div>
      )}

      {/* MODAL: BITMOJI PICKER */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full rounded-[2.5rem] p-8 border-2 border-black max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase italic">Pick Your Bitmoji</h2>
                <button onClick={() => setShowAvatarModal(false)}><X /></button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[...Array(19)].map((_, i) => (
                <div 
                  key={i} 
                  onClick={() => selectAvatar(i)}
                  className={`aspect-square rounded-full border-2 p-1 cursor-pointer transition-all ${avatarIndex === i ? 'border-green-500 bg-green-50 scale-110' : 'border-gray-100 hover:border-black'}`}
                >
                  <img src={`/avatars/${i}.png`} className="w-full h-full rounded-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
    </>
);
}
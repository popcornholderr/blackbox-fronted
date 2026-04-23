"use client";
import { useState, useEffect } from 'react';
import { Heart, ThumbsDown, Copy, Plus, X, Image as ImageIcon, ArrowLeft, Check } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import AppGuard from '@/components/AppGuard';

export default function RoomPage() {
  
  const { slug } = useParams();
  const router = useRouter();
  
  // Data & UI States
  const [data, setData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  
  const [copied, setCopied] = useState(false);

  

  // Input States
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);

  
  
  
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
  const fetchRoom = () => {
    
    fetch(`http://localhost:5000/api/rooms/${slug}`)
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error("Error fetching room:", err));
  };

  const [seenDrops, setSeenDrops] = useState<string[]>([]);
  const [expandedDrops, setExpandedDrops] = useState<string[]>([]);
  useEffect(() => {
  const seen = JSON.parse(localStorage.getItem(`seenDrops-${slug}`) || '[]');
  setSeenDrops(seen);
}, [slug]);

useEffect(() => {
  const seen = JSON.parse(localStorage.getItem(`seenDrops-${slug}`) || '[]');
  setSeenDrops(seen);
}, [slug]);


  useEffect(() => { fetchRoom(); }, [slug]);

 useEffect(() => {
  if (!data) return;

  const currentSeen = JSON.parse(localStorage.getItem(`seenDrops-${slug}`) || '[]');
  setSeenDrops(currentSeen);

}, [data]);

useEffect(() => {
  const handleLeave = () => {
    if (!data) return;

    const currentSeen = JSON.parse(localStorage.getItem(`seenDrops-${slug}`) || '[]');

    const newIds = data.drops
      .map((d: any) => d._id)
      .filter((id: string) => !currentSeen.includes(id));

    const updatedSeen = [...currentSeen, ...newIds];

    localStorage.setItem(`seenDrops-${slug}`, JSON.stringify(updatedSeen));
  };

  window.addEventListener("beforeunload", handleLeave);

  return () => {
    window.removeEventListener("beforeunload", handleLeave);
  };
}, [data, slug]);

  // VOTE LOGIC (Handles Like/Dislike counts correctly)
  const handleVote = async (dropId: string, type: 'likes' | 'dislikes') => {
    const userId = localStorage.getItem('avatarIndex') || 'anon-' + Math.random(); 
    try {
      await fetch(`http://localhost:5000/api/drops/${dropId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type })
      });
      fetchRoom(); // Live refresh counts
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  // UI Helper: Read More
  const toggleExpand = (id: string) => {
    setExpandedDrops(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // UI Helper: Shaded Drops
  const getDropStyle = (index: number) => {
    const opacity = ["12", "18", "25", "10"]; 
    return { 
      backgroundColor: `${data.room.color}${opacity[index % opacity.length]}`,
      borderLeft: `4px solid ${data.room.color}40`
    };
  };

  const copyToClipboard = () => {
  // Use window.location.host to automatically get the current domain
  navigator.clipboard.writeText(`${window.location.host}/room/${slug}`);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};

  const handleImage = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 512000) return alert("File too large! Max 500KB.");
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = async () => {
    if (!content && !image) return alert("Write something or add a photo!");
    const av = localStorage.getItem('avatarIndex') || '0';
    
    await fetch('http://localhost:5000/api/drops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: data.room._id,
        content,
        image,
        tempName: name || "Anonymous",
        avatarIndex: parseInt(av),
        likes: [],
        dislikes: []
      })
    });

    setShowModal(false);
    setContent(""); setName(""); setImage(null);
    fetchRoom();
  };

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-xl font-black italic animate-pulse uppercase tracking-tighter">Fetching Drops...</div>
    </div>
  );
  

  return (
    <AppGuard>
    <main className="min-h-screen pb-32 relative overflow-x-hidden" style={{ backgroundColor: `${data.room.color}05` }}>
      {/* HEADER */}
      <header className="p-8 bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 flex items-center">
        <button 
  onClick={() => {
    // 1. Mark drops as seen (your existing logic)
    const currentSeen = JSON.parse(localStorage.getItem(`seenDrops-${slug}`) || '[]');
    const newIds = data.drops
      .map((d: any) => d._id)
      .filter((id: string) => !currentSeen.includes(id));
    const updatedSeen = [...currentSeen, ...newIds];
    localStorage.setItem(`seenDrops-${slug}`, JSON.stringify(updatedSeen));

    // 2. SMART NAVIGATION:
    // Check if the user has a previous page in this tab. 
    // If they came from a link, window.history.length will be 1 or 2.
    if (window.history.length <= 2) {
      router.push('/'); // Force go to home
    } else {
      router.back(); // Go back normally
    }
  }}
  className="p-2 border-2 border-black rounded-xl active:scale-90 transition-transform bg-white"
>
  <ArrowLeft size={18} />
</button>
        
        <div className="flex-1 text-center pr-10">
          <h1 className="text-2xl font-black uppercase italic truncate max-w-[250px] mx-auto" style={{ color: data.room.color }}>
            {data.room.title}
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1 text-[9px] font-bold text-gray-400 tracking-widest uppercase">
            <span>blackbox-omega-peach.vercel.app/room/{slug}</span>
            <button onClick={copyToClipboard} className="hover:text-black transition-colors">
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            </button>
          </div>
        </div>
      </header>

      {/* MASONRY FEED */}
      <div className="p-4 masonry-grid">
        {data.drops.map((drop: any, idx: number) => {
          const isExpanded = expandedDrops.includes(drop._id);
          const hasLiked = drop.likes.includes(localStorage.getItem('avatarIndex') || 'anon');
          const hasDisliked = drop.dislikes.includes(localStorage.getItem('avatarIndex') || 'anon');
// ✅ ADD THIS
  const isNew = !seenDrops.includes(drop._id)
          return (
            <div 
  key={drop._id} 
  className="relative masonry-item p-5 rounded-[2rem] border border-black/5 shadow-sm flex flex-col transition-all duration-500"
  style={getDropStyle(idx)}
>
  {/* 🔴 THIS IS THE SPOT */}
    {isNew && (
      <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
    )}
              {/* User Identity */}
              <div className="flex items-center gap-2 mb-3">
                <img src={`/avatars/${drop.avatarIndex}.png`} className="w-8 h-8 rounded-full border bg-white shadow-sm" alt="AV" />
                <span className="text-[10px] font-black uppercase text-black/60 truncate max-w-[100px]">{drop.tempName}</span>
              </div>

              {/* Content */}
              {drop.image && <img src={drop.image} className="rounded-2xl mb-3 w-full border border-black/5 object-cover" alt="Drop" />}
              
              <div className="relative overflow-hidden transition-all duration-300">
                <p className={`text-sm font-medium leading-relaxed text-black/80 ${isExpanded ? '' : 'line-clamp-6'}`}>
                  {drop.content}
                </p>
                {drop.content.length > 200 && (
                  <button 
                    onClick={() => toggleExpand(drop._id)}
                    className="text-[10px] font-black uppercase text-black/40 mt-2 hover:text-black transition-colors underline decoration-dotted"
                  >
                    {isExpanded ? "Show Less" : "Read More..."}
                  </button>
                )}
              </div>

              {/* Interaction Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3">
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleVote(drop._id, 'likes')}
                    className={`flex items-center gap-1 text-[10px] font-black transition-transform active:scale-125 ${hasLiked ? 'text-black' : 'text-gray-400'}`}
                  >
                    <Heart size={12} fill={hasLiked ? "black" : "none"} /> {drop.likes.length}
                  </button>
                  <button 
                    onClick={() => handleVote(drop._id, 'dislikes')}
                    className={`flex items-center gap-1 text-[10px] font-black transition-transform active:scale-125 ${hasDisliked ? 'text-black' : 'text-gray-400'}`}
                  >
                    <ThumbsDown size={12} fill={hasDisliked ? "black" : "none"} /> {drop.dislikes.length}
                  </button>
                </div>
                <span className="text-[8px] text-gray-400 font-black uppercase tracking-tighter">{formatTime(drop.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD DROP BUTTON */}
      <button 
        onClick={() => setShowModal(true)}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-2xl z-50 transition-transform active:scale-90 hover:scale-105 border-2 border-white/20"
      >
        <Plus color="white" size={32} />
      </button>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 border-2 border-black shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-black uppercase italic tracking-tighter">New Drop</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:rotate-90 transition-transform"><X /></button>
            </div>
            
            <input 
              className="w-full border-2 border-black p-4 rounded-xl mb-4 font-bold outline-none placeholder:text-gray-300 focus:bg-gray-50 transition-colors" 
              placeholder="Display Name..." 
              value={name} onChange={e => setName(e.target.value)}
            />
            
            <textarea 
  maxLength={400}
  className="w-full border-2 border-black p-4 rounded-xl mb-2 h-32 resize-none outline-none placeholder:text-gray-300 focus:bg-gray-50 transition-colors" 
  placeholder="What's the tea?" 
  value={content} 
  onChange={e => setContent(e.target.value)}
/>

<p className="text-[10px] text-gray-400 text-right font-bold">
  {content.length}/400
</p>

            <div className="flex items-center gap-4 mb-8">
              <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 p-4 rounded-xl cursor-pointer hover:border-black transition-all bg-gray-50 hover:bg-white">
                <ImageIcon size={20} className="text-gray-400" />
                <span className="text-[10px] font-black uppercase text-gray-400">{image ? "Image Selected" : "Add Image (500KB)"}</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImage} />
              </label>
              {image && <button onClick={() => setImage(null)} className="text-red-500 font-black text-[10px] uppercase underline underline-offset-4">Remove</button>}
            </div>

            <button onClick={handleDrop} className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-zinc-800 active:scale-95 transition-all shadow-lg">Drop It</button>
          </div>
        </div>
      )}
    </main>
    </AppGuard>
  );

  
}

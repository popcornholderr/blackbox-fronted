"use client";
import { useState, useEffect } from 'react';
// ✅ ADD ChevronDown HERE
import { 
  Heart, 
  ThumbsDown, 
  Copy, 
  Plus, 
  X, 
  Image as ImageIcon, 
  ArrowLeft, 
  Check, 
  ChevronDown // <--- Add this one
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import AppGuard from '@/components/AppGuard';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function RoomPage() {
  
  const { slug } = useParams();
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const [replyBox, setReplyBox] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyName, setReplyName] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<string[]>([]);
  const [seenDrops, setSeenDrops] = useState<string[]>([]);
  const [expandedDrops, setExpandedDrops] = useState<string[]>([]);

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
    fetch(`${BASE_URL}/api/rooms/${slug}`)
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error("Error fetching room:", err));
  };

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
        .map((d: any) => String(d._id).trim())
        .filter((id: string) => !currentSeen.includes(id));
      localStorage.setItem(`seenDrops-${slug}`, JSON.stringify([...currentSeen, ...newIds]));
    };
    window.addEventListener("beforeunload", handleLeave);
    return () => window.removeEventListener("beforeunload", handleLeave);
  }, [data, slug]);

  const handleVote = async (dropId: string, type: 'likes' | 'dislikes') => {
    const userId = localStorage.getItem('avatarIndex') || 'anon-' + Math.random();
    try {
      await fetch(`${BASE_URL}/api/drops/${dropId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type })
      });
      fetchRoom();
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedDrops(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getDropStyle = (index: number) => {
    const opacity = ["12", "18", "25", "10"];
    return {
      backgroundColor: `${data.room.color}${opacity[index % opacity.length]}`,
      borderLeft: `4px solid ${data.room.color}40`
    };
  };

  const copyToClipboard = () => {
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
    await fetch(`${BASE_URL}/api/drops`, {
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

  // ✅ Reply logic extracted to its own function with explicit dropId string
const handleReply = async (dropId: string) => {
  if (!replyContent.trim()) return;

  // Remove trailing slash from BASE_URL if it exists
  const apiUrl = BASE_URL.replace(/\/$/, "");
  const targetUrl = `${apiUrl}/api/drops/${dropId.trim()}/reply`;

  console.log("Attempting request to:", targetUrl);

  try {
    const res = await fetch(targetUrl, {
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

    const contentType = res.headers.get("content-type");
    
    if (!res.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await res.json();
        console.error("API Error Object:", errorData);
      } else {
        const htmlError = await res.text();
        console.error("URL ROUTING ERROR. Backend sent HTML. First 50 chars:", htmlError.slice(0, 50));
        alert("Check Console: The backend route /api/drops/:id/reply is not responding.");
      }
      return;
    }

    // If successful
    const updatedDrop = await res.json();
    setReplyContent("");
    setReplyName("");
    setReplyBox(null);
    fetchRoom(); // Refresh data
  } catch (err) {
    console.error("Network Error:", err);
  }
};

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl font-black italic animate-pulse uppercase tracking-tighter">Fetching Drops...</div>
    </div>
  );

  return (
    <AppGuard>
    <main className="min-h-screen pb-32 relative overflow-x-hidden" style={{ backgroundColor: `${data.room.color}05` }}>

      {/* HEADER */}
      <header className="p-8 bg-black/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 flex items-center">
        <button
          onClick={() => {
            const currentSeen = JSON.parse(localStorage.getItem(`seenDrops-${slug}`) || '[]');
            const newIds = data.drops
              .map((d: any) => String(d._id).trim())
              .filter((id: string) => !currentSeen.includes(id));
            localStorage.setItem(`seenDrops-${slug}`, JSON.stringify([...currentSeen, ...newIds]));
            if (window.history.length <= 2) router.push('/');
            else router.back();
          }}
          className="p-2 border border-white/20 rounded-xl bg-black"
        >
          <ArrowLeft size={18} />
        </button>
        
        <div className="flex-1 text-center pr-10">
          <h1 className="text-2xl font-black uppercase italic truncate max-w-[250px] mx-auto" style={{ color: data.room.color }}>
            {data.room.title}
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1 text-[9px] font-bold hover:text-white tracking-widest uppercase">
            <span>blackbox-omega-peach.vercel.app/room/{slug}</span>
            <button onClick={copyToClipboard} className="hover:text-white transition-colors">
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            </button>
          </div>
        </div>
      </header>

      {/* MASONRY FEED */}
      <div className="p-4 masonry-grid">
        {data.drops.map((drop: any, idx: number) => {

          // ✅ THE FIX: one clean string ID, used everywhere for this drop
          const dropId = String(drop._id).trim();

          const isExpanded = expandedDrops.includes(dropId);
          const hasLiked = drop.likes.includes(localStorage.getItem('avatarIndex') || 'anon');
          const hasDisliked = drop.dislikes.includes(localStorage.getItem('avatarIndex') || 'anon');
          const isNew = !seenDrops.includes(dropId);

          return (
            <div
              key={dropId}
              className="relative masonry-item p-5 rounded-[2rem] border border-white/10 bg-[#0a0a0a] shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex flex-col transition-all duration-500"
              style={getDropStyle(idx)}
            >
              {isNew && (
                <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <img src={`/avatars/${drop.avatarIndex}.png`} className="w-8 h-8 rounded-full border shadow-sm" alt="AV" />
                <span className="text-[10px] font-black uppercase text-white/60 truncate max-w-[100px]">{drop.tempName}</span>
              </div>

              {drop.image && <img src={drop.image} className="rounded-2xl mb-3 w-full border border-black/5 object-cover" alt="Drop" />}
              
              <div className="relative transition-all duration-300">
                <p className="text-sm font-medium leading-relaxed text-white/80">
                  {isExpanded ? drop.content : drop.content.slice(0, 200)}
                </p>
                {drop.content.length > 200 && (
                  <button
                    onClick={() => toggleExpand(dropId)}
                    className="text-[10px] font-black uppercase text-white/40 mt-2 hover:text-white transition-colors underline decoration-dotted"
                  >
                    {isExpanded ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>

              <div className="mt-4 border-t border-white/10 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleVote(dropId, 'likes')}
                      className={`flex items-center gap-1 text-[10px] font-black ${hasLiked ? 'text-white' : 'hover:text-white'}`}
                    >
                      <Heart size={12} fill={hasLiked ? "black" : "none"} /> {drop.likes.length}
                    </button>
                    <button
                      onClick={() => handleVote(dropId, 'dislikes')}
                      className={`flex items-center gap-1 text-[10px] font-black ${hasDisliked ? 'text-white' : 'hover:text-white'}`}
                    >
                      <ThumbsDown size={12} fill={hasDisliked ? "black" : "none"} /> {drop.dislikes.length}
                    </button>
                  </div>
                  <span className="text-[8px] font-black uppercase">
                    {formatTime(drop.createdAt)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setReplyBox(dropId);
                    setReplyContent("");
                    setReplyName("");
                  }}
                  className="text-[10px] font-black text-white/40 hover:text-white"
                >
                  Reply
                </button>
              </div>

              {(drop.replies || []).length > 0 && (
  <button
    onClick={() =>
      setExpandedReplies(prev =>
        prev.includes(dropId)
          ? prev.filter(id => id !== dropId)
          : [...prev, dropId]
      )
    }
    className="flex items-center gap-1.5 text-[10px] font-black uppercase text-white/40 mt-3 hover:text-white transition-all group"
  >
    <span>{drop.replies.length} sub drops</span>
    
    {/* Dynamic Arrow Logic: Flips Up/Down based on state */}
    <div className={`transition-transform duration-300 ${expandedReplies.includes(dropId) ? 'rotate-180' : 'rotate-0'}`}>
      <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
    </div>
  </button>
)}

              {expandedReplies.includes(dropId) && (
  <div className="mt-4 ml-2 pl-4 border-l border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
    {(drop.replies || []).map((reply: any, i: number) => (
      <div key={i} className="flex gap-3 items-start">
        
        {/* Bitmoji Implementation */}
        <img 
          src={`/avatars/${reply.avatarIndex ?? 0}.png`} 
          className="w-7 h-7 rounded-full border border-white/10 bg-black shadow-sm flex-shrink-0" 
          alt="Bitmoji" 
        />
        
        <div className="flex-1 bg-white/[0.03] p-3 rounded-2xl rounded-tl-none border border-white/5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">
              {reply.tempName || "Anonymous"}
            </span>
          </div>
          <p className="text-xs text-white/80 leading-relaxed font-medium">
            {reply.content}
          </p>
        </div>
      </div>
    ))}
  </div>
)}

              {/* ✅ replyBox is a string, dropId is a string — comparison works correctly */}
              {replyBox === dropId && (
                <div className="mt-3 p-4 border border-white/10 rounded-2xl bg-black">
                  <input
                    value={replyName}
                    onChange={(e) => setReplyName(e.target.value)}
                    placeholder="Display Name..."
                    className="w-full mb-3 p-3 rounded-xl bg-[#111] border border-white/10 text-white text-sm outline-none"
                  />
                  <textarea
                    maxLength={400}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="What's the tea?"
                    className="w-full p-3 rounded-xl bg-[#111] border border-white/10 text-white text-sm outline-none resize-none h-24"
                  />
                  <p className="text-[10px] text-right mt-1 text-white/40">
                    {replyContent.length}/400
                  </p>
                  <div className="flex justify-end mt-3 gap-2">
                    <button
                      onClick={() => { setReplyBox(null); setReplyContent(""); setReplyName(""); }}
                      className="text-xs text-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReply(dropId)}
                      className="text-xs bg-white text-black px-4 py-2 rounded-xl font-black"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-2xl z-50 transition-transform active:scale-90 hover:scale-105 border-2 border-white/20"
      >
        <Plus color="white" size={32} />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[2.5rem] p-8 border-2 border-black shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-black uppercase italic tracking-tighter">New Drop</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:rotate-90 transition-transform"><X /></button>
            </div>
            <input
              className="w-full border border-white/10 bg-black text-white p-4 rounded-xl mb-4 font-bold outline-none placeholder:text-white/30 focus:bg-[#111] transition-colors"
              placeholder="Display Name..."
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <textarea
              maxLength={400}
              className="w-full border border-white/10 bg-black text-white p-4 rounded-xl mb-2 h-32 resize-none outline-none placeholder:text-white/30 focus:bg-[#111] transition-colors"
              placeholder="What's the tea?"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            <p className="text-[10px] hover:text-white text-right font-bold">
              {content.length}/400
            </p>
            <div className="flex items-center gap-4 mb-8">
              <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-white/10 bg-white/5 p-4 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                <ImageIcon size={20} className="hover:text-white" />
                <span className="text-[10px] font-black uppercase hover:text-white">{image ? "Image Selected" : "Add Image (500KB)"}</span>
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

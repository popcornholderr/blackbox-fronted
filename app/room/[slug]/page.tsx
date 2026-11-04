"use client";
import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import {
  Plus, X, Check, Link2, MessageCircle, ChartNoAxesColumn, Lock, ShieldCheck,
  UserCheck, UserX, ThumbsDown, Heart, ChevronLeft, Users, ChevronRight,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AppGuard from '@/components/AppGuard';
import Sheet, { PrimaryButton, fieldClass } from '@/components/Sheet';
import { RoomBackdrop, RoomHeader, GlassIconButton } from '@/components/RoomChrome';
import {
  BASE_URL, formatTime, getUserId, trackJoinRequest, markJoinApproved, autoSaveRoom, authHeaders, adminKey,
} from '@/lib/rooms';

const POLL_MS = 3000;

function ErrorMsg({ text, word }: { text: string; word?: string | null }) {
  if (!word) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(word.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <span className="underline decoration-2 underline-offset-2">{text.slice(idx, idx + word.length)}</span>
      {text.slice(idx + word.length)}
    </span>
  );
}

const hint = { color: 'var(--ink-2)' } as CSSProperties;

/* ── PRIVATE ROOM GATE ── */
function PrivateRoomGate({
  room, userId, onGranted, onBack,
}: { room: any; userId: string; onGranted: (isAdmin: boolean) => void; onBack: () => void }) {
  const [mode, setMode] = useState<'choose' | 'admin' | 'request'>('choose');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [reqName, setReqName] = useState('');
  const [reqError, setReqError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alreadyApproved, setAlreadyApproved] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/rooms/${room._id}/join-request/${userId}`);
        const data = await res.json();
        if (data.status === 'approved') {
          setAlreadyApproved(true);
          if (markJoinApproved(room)) autoSaveRoom(room._id);
        } else if (data.status === 'pending') {
          trackJoinRequest(room);
          setSent(true);
        }
      } catch { /* treat as not approved */ } finally { setChecking(false); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdminCode = async () => {
    if (!code.trim()) { setCodeError('Enter the code'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/rooms/${room._id}/verify-admin`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.isAdmin) {
        try { if (data.token) sessionStorage.setItem(adminKey(room.slug), data.token); } catch { /* ignore */ }
        onGranted(true);
      } else setCodeError('Wrong code');
    } catch { setCodeError('Network error'); } finally { setLoading(false); }
  };

  const handleJoinRequest = async () => {
    if (!reqName.trim()) { setReqError('Enter a name'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/rooms/${room._id}/join-request`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, name: reqName }),
      });
      const data = await res.json();
      if (data.status === 'approved') {
        if (markJoinApproved(room)) autoSaveRoom(room._id);
        onGranted(false);
      } else if (data.status === 'pending') {
        trackJoinRequest(room);
        setSent(true);
        setMode('choose');
      } else setReqError(data.error || 'Could not send');
    } catch { setReqError('Network error'); } finally { setLoading(false); }
  };

  const Row = ({ icon, title, sub, onClick, disabled }: { icon: React.ReactNode; title: string; sub?: string; onClick?: () => void; disabled?: boolean }) => (
    <button
      type="button" onClick={onClick} disabled={disabled}
      className="group-row w-full flex items-center gap-3.5 px-4 py-3.5 text-left active:bg-black/[0.04] transition-colors disabled:opacity-50"
    >
      <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--fill)' }}>{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-[18px] font-semibold" style={{ letterSpacing: '-0.02em' }}>{title}</span>
        {sub && <span className="block text-[14px] mt-0.5" style={hint}>{sub}</span>}
      </span>
      {!disabled && <ChevronRight size={18} strokeWidth={2.2} style={{ color: 'var(--ink-3)' }} />}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 relative">
      <RoomBackdrop color={room.color} />
      <div className="fixed left-4 z-10" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
        <GlassIconButton onClick={mode === 'choose' ? onBack : () => { setMode('choose'); setCodeError(''); setReqError(''); }} label="Back">
          <ChevronLeft size={22} strokeWidth={2.4} className="-ml-0.5" />
        </GlassIconButton>
      </div>

      <motion.div initial={{ opacity: 0, y: 18, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }} className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-9">
          <div className="glass w-[82px] h-[82px] rounded-full flex items-center justify-center mb-5">
            <Lock size={28} strokeWidth={1.9} />
          </div>
          <h1 className="text-[30px] font-bold text-center" style={{ letterSpacing: '-0.04em' }}>{room.title}</h1>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'choose' && (
            <motion.div key="choose" initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} className="group-card">
              <Row icon={<ShieldCheck size={19} strokeWidth={1.9} />} title="Admin code" onClick={() => setMode('admin')} />
              {checking ? (
                <Row icon={<Users size={19} strokeWidth={1.9} />} title="Checking" disabled />
              ) : alreadyApproved ? (
                <Row icon={<UserCheck size={19} strokeWidth={1.9} />} title="Enter room" sub="You're approved" onClick={() => onGranted(false)} />
              ) : sent ? (
                <Row icon={<Users size={19} strokeWidth={1.9} />} title="Request sent" sub="You'll find it in your inbox once approved" disabled />
              ) : (
                <Row icon={<Users size={19} strokeWidth={1.9} />} title="Request to join" onClick={() => setMode('request')} />
              )}
            </motion.div>
          )}

          {mode === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 14 }} className="flex flex-col gap-3">
              <input
                className={`${fieldClass} ${codeError ? 'animate-shake' : ''}`} type="password" placeholder="Admin code" autoFocus
                value={code} onChange={(e) => { setCode(e.target.value); setCodeError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdminCode(); }}
              />
              <div className="h-5 text-[14px] font-semibold px-1" style={hint}>{codeError}</div>
              <PrimaryButton onClick={handleAdminCode} disabled={loading}>{loading ? 'Verifying' : 'Continue'}</PrimaryButton>
            </motion.div>
          )}

          {mode === 'request' && (
            <motion.div key="request" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 14 }} className="flex flex-col gap-3">
              <input
                className={`${fieldClass} ${reqError ? 'animate-shake' : ''}`} placeholder="Your name" autoFocus maxLength={30}
                value={reqName} onChange={(e) => { setReqName(e.target.value); setReqError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleJoinRequest(); }}
              />
              <div className="h-5 text-[14px] font-semibold px-1" style={hint}>{reqError}</div>
              <PrimaryButton onClick={handleJoinRequest} disabled={loading}>{loading ? 'Sending' : 'Send request'}</PrimaryButton>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ── ADMIN PANEL ── */
function AdminPanel({ room, open, onClose }: { room: any; open: boolean; onClose: () => void }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/rooms/${room._id}/join-requests`, { headers: authHeaders(room.slug) });
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch { setRequests([]); } finally { setLoading(false); }
  }, [room._id]);

  useEffect(() => {
    if (!open) return;
    fetchRequests();
    const t = setInterval(fetchRequests, 3000);
    return () => clearInterval(t);
  }, [open, fetchRequests]);

  const act = async (id: string, action: 'approved' | 'denied' | 'kick') => {
    setRequests((r) => r.filter((x) => x._id !== id));
    await fetch(`${BASE_URL}/api/rooms/${room._id}/join-requests/${id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders(room.slug) }, body: JSON.stringify({ action }),
    }).catch(() => {});
    fetchRequests();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Requests">
      {loading ? (
        <div className="py-12 text-center text-[16px] font-semibold" style={{ color: 'var(--ink-3)' }}>&nbsp;</div>
      ) : requests.length === 0 ? (
        <div className="py-12 flex flex-col items-center gap-3" style={{ color: 'var(--ink-3)' }}>
          <Users size={28} strokeWidth={1.6} />
          <span className="text-[16px] font-semibold">No requests</span>
        </div>
      ) : (
        <div className="group-card mb-2" style={{ background: 'rgba(255,255,255,0.6)' }}>
          {requests.map((req) => (
            <div key={req._id} className="group-row flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-[17.5px] font-semibold truncate" style={{ letterSpacing: '-0.02em' }}>{req.name}</p>
                <p className="text-[13.5px]" style={hint}>{formatTime(req.createdAt)}</p>
              </div>
              <button onClick={() => act(req._id, 'denied')} aria-label="Deny" className="press w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--fill)' }}>
                <UserX size={17} strokeWidth={2} style={{ color: 'var(--ink-2)' }} />
              </button>
              <button onClick={() => act(req._id, 'approved')} aria-label="Approve" className="press w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: 'var(--ink)' }}>
                <UserCheck size={17} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}

/* ── RoomContent ── */
function RoomContent() {
  const { slug } = useParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [showDrop, setShowDrop] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [fab, setFab] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try { return !!sessionStorage.getItem(adminKey(String(slug))); } catch { return false; }
  });

  // gate clearance survives a trip into a drop and back
  const GATE_KEY = `gateCleared-${slug}`;
  const [gateCleared, setGateCleared] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(GATE_KEY) === '1';
  });

  const [dropName, setDropName] = useState('');
  const [dropContent, setDropContent] = useState('');
  const [dropError, setDropError] = useState<string | null>(null);
  const [dropBadWord, setDropBadWord] = useState<string | null>(null);

  const [pollName, setPollName] = useState('');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollMultiple, setPollMultiple] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);
  const [pollBadWord, setPollBadWord] = useState<string | null>(null);

  const [focusId, setFocusId] = useState<string | null>(null);
  const focusDone = useRef(false);
  const [seenDrops, setSeenDrops] = useState<string[]>([]);
  const [newDropIds, setNewDropIds] = useState<string[]>([]);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const ROOM_SCROLL_KEY = `scrollPos-room-${slug}`;
  const userId = getUserId();

  useEffect(() => {
    setSeenDrops(JSON.parse(localStorage.getItem(`seenDrops-${slug}`) || '[]'));
  }, [slug]);

  // arriving from "Most popular drop today": remember which drop we came for
  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get('drop');
    if (d) setFocusId(d.trim());
  }, [slug]);

  useEffect(() => {
    if (!data) return;
    if (data.room?.isPrivate && !gateCleared) return;
    const saved = sessionStorage.getItem(ROOM_SCROLL_KEY);
    if (saved) {
      // coming back from a drop: return to where we were
      const target = parseInt(saved, 10);
      sessionStorage.removeItem(ROOM_SCROLL_KEY);
      focusDone.current = true;
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: target, behavior: 'instant' as ScrollBehavior })));
      return;
    }
    if (!focusId || focusDone.current) return;
    if (!(data.drops || []).some((d: any) => String(d._id).trim() === focusId)) return;
    focusDone.current = true;
    // jump straight to the drop, centered on screen
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.getElementById(`drop-${focusId}`)?.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, gateCleared, focusId]);

  const fetchRoom = useCallback(async (silent = false) => {
    try {
      const res = await fetch(`${BASE_URL}/api/rooms/${slug}`, { headers: authHeaders(String(slug)) });
      if (!res.ok) return;
      const incoming = await res.json();
      if (!silent) {
        knownIdsRef.current = new Set(incoming.drops.map((d: any) => String(d._id).trim()));
        setData(incoming);
        return;
      }
      const ids = incoming.drops.map((d: any) => String(d._id).trim());
      const brandNew = ids.filter((id: string) => !knownIdsRef.current.has(id));
      if (brandNew.length) {
        brandNew.forEach((id: string) => knownIdsRef.current.add(id));
        setNewDropIds((prev) => [...prev, ...brandNew]);
        setTimeout(() => setNewDropIds((prev) => prev.filter((id) => !brandNew.includes(id))), 800);
      }
      setData(incoming);
    } catch { /* keep last good data */ }
  }, [slug]);

  useEffect(() => {
    fetchRoom(false);
    timerRef.current = setInterval(() => fetchRoom(true), POLL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetchRoom]);

  useEffect(() => {
    const mark = () => {
      if (!data) return;
      const cs = JSON.parse(localStorage.getItem(`seenDrops-${slug}`) || '[]');
      const add = data.drops.map((d: any) => String(d._id).trim()).filter((id: string) => !cs.includes(id));
      localStorage.setItem(`seenDrops-${slug}`, JSON.stringify([...cs, ...add]));
    };
    window.addEventListener('beforeunload', mark);
    return () => window.removeEventListener('beforeunload', mark);
  }, [data, slug]);

  const handleGateGranted = useCallback((adminFlag: boolean) => {
    sessionStorage.setItem(GATE_KEY, '1');
    setGateCleared(true);
    if (adminFlag) { setIsAdmin(true); setShowAdmin(true); }
    fetchRoom(false); // contents are only sent once the server knows we're allowed in
  }, [GATE_KEY, fetchRoom]);

  const handleBack = () => {
    if (data) {
      const cs = JSON.parse(localStorage.getItem(`seenDrops-${slug}`) || '[]');
      const add = data.drops.map((d: any) => String(d._id).trim()).filter((id: string) => !cs.includes(id));
      localStorage.setItem(`seenDrops-${slug}`, JSON.stringify([...cs, ...add]));
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (window.history.length <= 2) router.push('/'); else router.back();
  };

  const handleVote = async (dropId: string, type: 'likes' | 'dislikes', e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`${BASE_URL}/api/drops/${dropId}/vote`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders(String(slug)) }, body: JSON.stringify({ userId, type }),
    }).catch(() => {});
    fetchRoom(true);
  };

  const handlePollVote = async (pollId: string, optionIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`${BASE_URL}/api/polls/${pollId}/vote`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders(String(slug)) }, body: JSON.stringify({ userId, optionIndex }),
    }).catch(() => {});
    fetchRoom(true);
  };

  const handleDrop = async () => {
    if (!dropContent.trim()) return;
    setDropError(null); setDropBadWord(null);
    const av = parseInt(localStorage.getItem('avatarIndex') || '0');
    const res = await fetch(`${BASE_URL}/api/drops`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders(String(slug)) },
      body: JSON.stringify({ roomId: data.room._id, content: dropContent, tempName: dropName || 'Anonymous', avatarIndex: av }),
    });
    if (!res.ok) {
      const r = await res.json();
      setDropError(r.error || 'Something went wrong');
      setDropBadWord(r.abusiveWord || null);
      setTimeout(() => { setDropError(null); setDropBadWord(null); }, 3000);
      return;
    }
    setShowDrop(false); setDropContent(''); setDropName('');
    fetchRoom(true);
  };

  const handleCreatePoll = async () => {
    const opts = pollOptions.filter((o) => o.trim());
    if (!pollQuestion.trim()) { setPollError('Add a question'); return; }
    if (opts.length < 2) { setPollError('Add at least 2 options'); return; }
    setPollError(null); setPollBadWord(null);
    const av = parseInt(localStorage.getItem('avatarIndex') || '0');
    const res = await fetch(`${BASE_URL}/api/polls`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders(String(slug)) },
      body: JSON.stringify({ roomId: data.room._id, question: pollQuestion, options: opts, allowMultiple: pollMultiple, tempName: pollName || 'Anonymous', avatarIndex: av }),
    });
    if (!res.ok) {
      const r = await res.json();
      setPollError(r.error || 'Something went wrong');
      setPollBadWord(r.abusiveWord || null);
      setTimeout(() => { setPollError(null); setPollBadWord(null); }, 3000);
      return;
    }
    setShowPoll(false); setPollQuestion(''); setPollName(''); setPollOptions(['', '']); setPollMultiple(false);
    fetchRoom(true);
  };

  const navigateToDrop = (dropId: string) => {
    sessionStorage.setItem(ROOM_SCROLL_KEY, String(window.scrollY));
    const cs = JSON.parse(localStorage.getItem(`seenDrops-${slug}`) || '[]');
    if (!cs.includes(dropId)) localStorage.setItem(`seenDrops-${slug}`, JSON.stringify([...cs, dropId]));
    router.push(`/room/${slug}/${dropId}`);
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/room/${slug}`).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  /* ── loading ── */
  if (!data) {
    return (
      <div className="min-h-screen relative">
        <RoomHeader title="" onBack={() => router.push('/')} />
        <div className="masonry-grid px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 84px)' }}>
          {[150, 110, 190, 130, 100, 160].map((h, i) => (
            <div key={i} className="masonry-item skeleton rounded-[28px]" style={{ height: h, animationDelay: `${i * 90}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  if (data.room.isPrivate && !gateCleared) {
    return <PrivateRoomGate room={data.room} userId={userId} onGranted={handleGateGranted} onBack={handleBack} />;
  }

  const drops = (data.drops || []).map((d: any) => ({ ...d, _type: 'drop' }));
  const polls = (data.polls || []).map((p: any) => ({ ...p, _type: 'poll' }));
  const feed = [...drops, ...polls].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const roomVars = { ['--c' as any]: data.room.color } as CSSProperties;

  return (
    <main className="min-h-screen relative overflow-x-hidden max-w-[32rem] mx-auto" style={{ ...roomVars, paddingBottom: 150 }}>
      <RoomBackdrop color={data.room.color} />
      <RoomHeader
        title={data.room.title}
        lock={data.room.isPrivate}
        onBack={handleBack}
        right={
          <>
            {isAdmin && (
              <GlassIconButton onClick={() => setShowAdmin(true)} label="Requests"><ShieldCheck size={19} strokeWidth={2} /></GlassIconButton>
            )}
            <GlassIconButton onClick={copyLink} label="Copy link">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={copied ? 'c' : 'l'} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.16 }}>
                  {copied ? <Check size={19} strokeWidth={2.6} /> : <Link2 size={19} strokeWidth={2} />}
                </motion.span>
              </AnimatePresence>
            </GlassIconButton>
          </>
        }
      />

      {/* FEED */}
      <div className="px-4 masonry-grid" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 84px)' }}>
        {feed.length === 0 && (
          <div className="flex flex-col items-center gap-3 pt-24" style={{ columnSpan: 'all', color: 'var(--ink-3)' }}>
            <MessageCircle size={30} strokeWidth={1.5} />
          </div>
        )}
        {feed.map((item: any) => {
          if (item._type === 'poll') {
            const total = item.options.reduce((s: number, o: any) => s + o.voters.length, 0);
            const voted = item.options.some((o: any) => o.voters.includes(userId));
            return (
              <div key={String(item._id)} className="tint-card masonry-item rounded-[28px] p-4" style={roomVars}>
                <div className="flex items-center gap-2 mb-3">
                  <img src={`/avatars/${item.avatarIndex ?? 0}.png`} className="w-8 h-8 rounded-full" alt="" />
                  <span className="text-[14px] font-semibold truncate flex-1" style={{ letterSpacing: '-0.01em' }}>{item.tempName}</span>
                  <ChartNoAxesColumn size={15} strokeWidth={2.2} style={{ color: 'var(--ink-3)' }} />
                </div>
                <p className="text-[16.5px] font-semibold leading-snug mb-3" style={{ letterSpacing: '-0.02em' }}>{item.question}</p>
                <div className="flex flex-col gap-1.5">
                  {item.options.map((opt: any, i: number) => {
                    const pct = total > 0 ? Math.round((opt.voters.length / total) * 100) : 0;
                    const mine = opt.voters.includes(userId);
                    return (
                      <button
                        key={i} onClick={(e) => handlePollVote(String(item._id), i, e)}
                        className="press relative overflow-hidden rounded-full text-left min-h-[37px]"
                        style={{ background: 'rgba(255,255,255,0.6)', boxShadow: mine ? '0 0 0 1.5px var(--ink)' : '0 0 0 0.5px rgba(0,0,0,0.06)' }}
                      >
                        {voted && (
                          <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.max(pct, 3)}%`, background: mine ? 'rgba(11,11,13,0.14)' : 'rgba(11,11,13,0.06)', transition: 'width .7s var(--ease)' }} />
                        )}
                        <div className="relative px-3.5 py-2 flex items-center justify-between gap-2">
                          <span className="text-[14.5px] font-medium">{opt.text}</span>
                          {voted && <span className="text-[13px] font-semibold shrink-0" style={hint}>{pct}%</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center justify-between text-[13px] font-medium" style={hint}>
                  <span>{total}</span>
                  <span>{formatTime(item.createdAt)}</span>
                </div>
              </div>
            );
          }

          const dropId = String(item._id).trim();
          const liked = item.likes.includes(userId);
          const disliked = item.dislikes.includes(userId);
          const isNew = !seenDrops.includes(dropId);
          const rc = (item.replies || []).length;
          const isLong = item.content.length > 90;
          const isFocus = focusId === dropId;
          const display = isLong && !isFocus ? item.content.slice(0, 90).trimEnd() + '…' : item.content;

          return (
            <div
              key={dropId}
              id={`drop-${dropId}`}
              onClick={() => navigateToDrop(dropId)}
              className={`tint-card masonry-item rounded-[28px] p-4 cursor-pointer ${isFocus ? 'drop-focus' : 'transition-transform duration-300 active:scale-[0.97]'} ${newDropIds.includes(dropId) ? 'new-drop-liquid' : ''}`}
              style={roomVars}
            >
              {isNew && <span className="absolute top-3.5 right-3.5 w-[7px] h-[7px] rounded-full" style={{ background: 'var(--ink)' }} />}
              <div className="flex items-center gap-2 mb-2.5">
                <img src={`/avatars/${item.avatarIndex ?? 0}.png`} className="w-8 h-8 rounded-full" alt="" />
                <span className="text-[14px] font-semibold truncate max-w-[108px]" style={{ letterSpacing: '-0.01em' }}>{item.tempName}</span>
              </div>
              <p className="text-[16px] leading-[1.38] font-medium" style={{ letterSpacing: '-0.012em' }}>{display}</p>
              <div className="mt-3.5 flex items-center gap-3.5 text-[13.5px] font-semibold" style={hint}>
                <button onClick={(e) => handleVote(dropId, 'likes', e)} className="press flex items-center gap-1" style={liked ? { color: 'var(--ink)' } : undefined}>
                  <Heart size={14} strokeWidth={2.1} fill={liked ? 'currentColor' : 'none'} /> {item.likes.length}
                </button>
                <button onClick={(e) => handleVote(dropId, 'dislikes', e)} className="press flex items-center gap-1" style={disliked ? { color: 'var(--ink)' } : undefined}>
                  <ThumbsDown size={14} strokeWidth={2.1} fill={disliked ? 'currentColor' : 'none'} /> {item.dislikes.length}
                </button>
                {rc > 0 && <span className="flex items-center gap-1"><MessageCircle size={14} strokeWidth={2.1} /> {rc}</span>}
                <span className="ml-auto font-medium">{formatTime(item.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD */}
      <AnimatePresence>
        {fab && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setFab(false)}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(255,255,255,0.4)', WebkitBackdropFilter: 'blur(10px)', backdropFilter: 'blur(10px)' }}
          />
        )}
      </AnimatePresence>
      <div className="fixed inset-x-0 z-50 flex flex-col items-center gap-3 pointer-events-none" style={{ bottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
        <AnimatePresence>
          {fab && (
            <>
              <motion.button
                initial={{ opacity: 0, y: 24, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 460, damping: 30, delay: 0.05 }}
                onClick={() => { setFab(false); setShowPoll(true); }}
                className="glass glass-strong press pointer-events-auto h-[52px] pl-5 pr-6 rounded-full flex items-center gap-2.5 text-[17.5px] font-semibold"
                style={{ letterSpacing: '-0.02em' }}
              >
                <ChartNoAxesColumn size={19} strokeWidth={2} /> Poll
              </motion.button>
              <motion.button
                initial={{ opacity: 0, y: 24, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 460, damping: 30 }}
                onClick={() => { setFab(false); setShowDrop(true); }}
                className="glass glass-strong press pointer-events-auto h-[52px] pl-5 pr-6 rounded-full flex items-center gap-2.5 text-[17.5px] font-semibold"
                style={{ letterSpacing: '-0.02em' }}
              >
                <MessageCircle size={19} strokeWidth={2} /> Drop
              </motion.button>
            </>
          )}
        </AnimatePresence>
        <button
          onClick={() => setFab((p) => !p)} aria-label="New"
          className="glass press pointer-events-auto w-[67px] h-[67px] rounded-full flex items-center justify-center"
        >
          <motion.span animate={{ rotate: fab ? 45 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 24 }} className="flex">
            <Plus size={30} strokeWidth={2.2} />
          </motion.span>
        </button>
      </div>

      {/* DROP */}
      <Sheet open={showDrop} onClose={() => { setShowDrop(false); setDropError(null); }} title="New Drop">
        <div className="flex flex-col gap-3">
          <input className={fieldClass} placeholder="Name (optional)" maxLength={30} value={dropName} onChange={(e) => setDropName(e.target.value)} />
          <textarea
            maxLength={400}
            className={`${fieldClass} h-36 resize-none ${dropError ? 'animate-shake' : ''}`}
            placeholder="What's the tea?"
            value={dropContent}
            onChange={(e) => { setDropContent(e.target.value); setDropError(null); setDropBadWord(null); }}
          />
          <div className="flex items-center justify-between px-1 h-5 text-[14px] font-semibold" style={hint}>
            <span>{dropError && <ErrorMsg text={dropError} word={dropBadWord} />}</span>
            <span style={{ color: 'var(--ink-3)' }}>{dropContent.length}/400</span>
          </div>
          <PrimaryButton onClick={handleDrop} disabled={!dropContent.trim()}>Drop</PrimaryButton>
        </div>
      </Sheet>

      {/* POLL */}
      <Sheet open={showPoll} onClose={() => { setShowPoll(false); setPollError(null); }} title="New Poll">
        <div className="flex flex-col gap-3">
          <input className={fieldClass} placeholder="Name (optional)" maxLength={30} value={pollName} onChange={(e) => setPollName(e.target.value)} />
          <textarea
            maxLength={200}
            className={`${fieldClass} h-24 resize-none ${pollError ? 'animate-shake' : ''}`}
            placeholder="Ask something"
            value={pollQuestion}
            onChange={(e) => { setPollQuestion(e.target.value); setPollError(null); }}
          />
          <div className="flex flex-col gap-2">
            {pollOptions.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  maxLength={80} className={`${fieldClass} !py-3`} placeholder={`Option ${i + 1}`} value={opt}
                  onChange={(e) => { const u = [...pollOptions]; u[i] = e.target.value; setPollOptions(u); setPollError(null); }}
                />
                {pollOptions.length > 2 && (
                  <button onClick={() => setPollOptions((p) => p.filter((_, j) => j !== i))} aria-label="Remove option" className="press w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--fill)' }}>
                    <X size={15} strokeWidth={2.6} style={hint} />
                  </button>
                )}
              </div>
            ))}
            {pollOptions.length < 4 && (
              <button onClick={() => setPollOptions((p) => [...p, ''])} className="press self-start flex items-center gap-1.5 text-[16px] font-semibold px-3.5 h-9 rounded-full" style={{ background: 'var(--fill)' }}>
                <Plus size={15} strokeWidth={2.6} /> Option
              </button>
            )}
          </div>
          <div className="group-card" style={{ background: 'rgba(255,255,255,0.6)' }}>
            <div className="flex items-center justify-between px-4 h-[58px]">
              <span className="text-[18px] font-medium" style={{ letterSpacing: '-0.02em' }}>Multiple choice</span>
              <button type="button" role="switch" aria-checked={pollMultiple} aria-label="Multiple choice" className="ios-switch" onClick={() => setPollMultiple((p) => !p)}><i /></button>
            </div>
          </div>
          <div className="h-5 px-1 text-[14px] font-semibold" style={hint}>{pollError && <ErrorMsg text={pollError} word={pollBadWord} />}</div>
          <PrimaryButton onClick={handleCreatePoll}>Launch</PrimaryButton>
        </div>
      </Sheet>

      <AdminPanel room={data.room} open={showAdmin} onClose={() => setShowAdmin(false)} />
    </main>
  );
}

export default function RoomPage() {
  return (
    <AppGuard>
      <RoomContent />
    </AppGuard>
  );
}

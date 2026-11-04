"use client";

import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import IntroScreen from '@/components/IntroScreen';
import TabBar, { type TabKey } from '@/components/TabBar';
import HomeTab from '@/components/tabs/HomeTab';
import SavedTab from '@/components/tabs/SavedTab';
import ProfileTab from '@/components/tabs/ProfileTab';
import AddTab, { freshRoom, type NewRoom } from '@/components/tabs/AddTab';
import { useToast } from '@/components/Toast';
import {
  BASE_URL, getUserId, getInbox, refreshJoinRequests, autoSaveRoom, type JoinRecord,
} from '@/lib/rooms';

/* The intro plays when the site is opened. This lives at module level, so
   it survives in-app navigation (coming back from a room) but resets on a
   fresh load of the site. */
let introPlayed = false;

const TABS: TabKey[] = ['home', 'add', 'saved', 'profile'];

export default function HomePage() {
  const router = useRouter();
  const [toast, showToast] = useToast();

  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [tab, setTab] = useState<TabKey>('home');

  const [rooms, setRooms] = useState<any[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('cachedRooms') || '[]'); } catch { return []; }
  });
  const [roomsLoaded, setRoomsLoaded] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try { return !!localStorage.getItem('cachedRooms'); } catch { return false; }
  });
  const [fetchError, setFetchError] = useState(false);

  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [lastSeenMap, setLastSeenMap] = useState<Record<string, number>>({});
  const [bestDrop, setBestDrop] = useState<any>(null);
  const [bestPoll, setBestPoll] = useState<any>(null);
  const [inbox, setInbox] = useState<JoinRecord[]>([]);

  const [newRoom, setNewRoom] = useState<NewRoom>(() => freshRoom());
  const [creating, setCreating] = useState(false);

  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchingRef = useRef(false);
  const scrollMemo = useRef<Record<string, number>>({});
  const pendingScroll = useRef<{ tab: TabKey; y: number } | null>(null);
  const scrollRestored = useRef(false);
  const introActiveRef = useRef(false);

  /* ── boot ── */
  useEffect(() => {
    setMounted(true);
    try {
      setSavedIds(JSON.parse(localStorage.getItem('savedRooms') || '[]'));
      setAvatarIndex(parseInt(localStorage.getItem('avatarIndex') || '0') || 0);
      setLastSeenMap(JSON.parse(localStorage.getItem('lastSeenMap') || '{}'));
    } catch { /* storage unavailable */ }
    setInbox(getInbox());

    if (!introPlayed) { introPlayed = true; introActiveRef.current = true; setShowIntro(true); setTimeout(() => { introActiveRef.current = false; }, 2600); }

    const rt = sessionStorage.getItem('returnTab') as TabKey | null;
    const rs = sessionStorage.getItem('returnScrollY');
    sessionStorage.removeItem('returnTab');
    sessionStorage.removeItem('returnScrollY');
    if (rt && TABS.includes(rt)) {
      setTab(rt);
      if (rs) pendingScroll.current = { tab: rt, y: parseInt(rs, 10) || 0 };
    }
  }, []);

  /* ── restore scroll after returning from a room ── */
  useEffect(() => {
    if (!roomsLoaded || scrollRestored.current) return;
    const p = pendingScroll.current;
    if (!p || p.tab !== tab) return;
    scrollRestored.current = true;
    pendingScroll.current = null;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: p.y, behavior: 'instant' as ScrollBehavior })));
    return () => cancelAnimationFrame(id);
  }, [roomsLoaded, tab]);

  /* ── data ── */
  const fetchRooms = useCallback(async (attempt = 0): Promise<void> => {
    if (fetchingRef.current && attempt === 0) return;
    fetchingRef.current = true;
    setFetchError(false);
    const ctl = new AbortController();
    const tid = setTimeout(() => ctl.abort(), 8000);
    try {
      const res = await fetch(`${BASE_URL}/api/rooms`, { signal: ctl.signal });
      clearTimeout(tid);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRooms(data); setRoomsLoaded(true); setFetchError(false);
      try { localStorage.setItem('cachedRooms', JSON.stringify(data)); } catch { /* ignore */ }
    } catch {
      clearTimeout(tid);
      if (attempt < 4) retryRef.current = setTimeout(() => fetchRooms(attempt + 1), (attempt + 1) * 2000);
      else { setFetchError(true); setRoomsLoaded(true); }
    } finally { fetchingRef.current = false; }
  }, []);

  const fetchBest = useCallback(async () => {
    try {
      const [dr, pr] = await Promise.all([fetch(`${BASE_URL}/api/today/best-drop`), fetch(`${BASE_URL}/api/today/best-poll`)]);
      if (dr.ok) setBestDrop(await dr.json());
      if (pr.ok) setBestPoll(await pr.json());
    } catch { /* optional content */ }
  }, []);

  useEffect(() => {
    fetchRooms();
    fetchBest();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    return () => { if (retryRef.current) clearTimeout(retryRef.current); };
  }, [fetchRooms, fetchBest]);

  /* ── inbox: poll pending join requests, auto-save approvals, expire after 24h ── */
  const syncInbox = useCallback(async () => {
    const approved = await refreshJoinRequests(getUserId());
    let changedSaved = false;
    approved.forEach((r) => { if (autoSaveRoom(r.roomId)) changedSaved = true; });
    if (changedSaved) {
      try { setSavedIds(JSON.parse(localStorage.getItem('savedRooms') || '[]')); } catch { /* ignore */ }
      fetchRooms();
    }
    if (approved.length) {
      const msg = approved.length === 1 ? `Approved: ${approved[0].title}` : `${approved.length} rooms approved`;
      setTimeout(() => showToast(msg), introActiveRef.current ? 2600 : 0);
    }
    setInbox(getInbox());
  }, [fetchRooms, showToast]);

  useEffect(() => {
    if (!mounted) return;
    syncInbox();
    const poll = setInterval(syncInbox, 20000);
    const tick = setInterval(() => setInbox(getInbox()), 60000);
    return () => { clearInterval(poll); clearInterval(tick); };
  }, [mounted, syncInbox]);

  /* ── actions ── */
  const toggleSave = useCallback(async (id: string) => {
    const was = savedIds.includes(id);
    const next = was ? savedIds.filter((i) => i !== id) : [...savedIds, id];
    setSavedIds(next);
    try { localStorage.setItem('savedRooms', JSON.stringify(next)); } catch { /* ignore */ }
    setRooms((prev) => prev.map((r) => r._id === id ? { ...r, savedCount: Math.max(0, (r.savedCount || 0) + (was ? -1 : 1)) } : r));
    try {
      await fetch(`${BASE_URL}/api/rooms/${id}/save`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: was ? 'decrement' : 'increment' }),
      });
      fetchRooms();
    } catch { setSavedIds((prev) => was ? [...prev, id] : prev.filter((i) => i !== id)); }
  }, [savedIds, fetchRooms]);

  const markRoomSeen = useCallback((roomId: string) => {
    sessionStorage.setItem('returnScrollY', String(window.scrollY));
    sessionStorage.setItem('returnTab', tab);
    if (!roomId) return;
    const upd = { ...lastSeenMap, [roomId]: Date.now() };
    setLastSeenMap(upd);
    try { localStorage.setItem('lastSeenMap', JSON.stringify(upd)); } catch { /* ignore */ }
  }, [tab, lastSeenMap]);

  const pickAvatar = (i: number) => {
    setAvatarIndex(i);
    try { localStorage.setItem('avatarIndex', String(i)); } catch { /* ignore */ }
  };

  const openInboxRoom = (r: JoinRecord) => {
    markRoomSeen(r.roomId);
    router.push(`/room/${r.slug}`);
  };

  const createRoom = async () => {
    if (creating) return;
    if (!newRoom.title.trim()) return showToast('Give it a name');
    if (newRoom.isPrivate && !newRoom.adminCode.trim()) return showToast('Add an admin code');
    setCreating(true);
    try {
      const res = await fetch(`${BASE_URL}/api/rooms`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newRoom),
      });
      if (!res.ok) { showToast('Name already taken'); return; }
      const created = await res.json();
      let cs: string[] = [];
      try { cs = JSON.parse(localStorage.getItem('savedRooms') || '[]'); } catch { /* ignore */ }
      if (!cs.includes(created._id)) {
        const upd = [...cs, created._id];
        setSavedIds(upd);
        try { localStorage.setItem('savedRooms', JSON.stringify(upd)); } catch { /* ignore */ }
      }
      let copied = false;
      try { await navigator.clipboard.writeText(`${window.location.origin}/room/${created.slug}`); copied = true; } catch { /* clipboard blocked */ }
      showToast(copied ? 'Created. Link copied' : 'Created');
      setNewRoom(freshRoom());
      fetchRooms();
      changeTab('saved');
    } catch {
      showToast('Connection issue');
    } finally { setCreating(false); }
  };

  /* ── tabs (remember scroll per tab) ── */
  const tabRef = useRef<TabKey>('home');
  useEffect(() => { tabRef.current = tab; }, [tab]);
  const changeTab = useCallback((next: TabKey) => {
    const cur = tabRef.current;
    if (cur === next) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    scrollMemo.current[cur] = window.scrollY;
    tabRef.current = next;
    setTab(next);
  }, []);

  useLayoutEffect(() => {
    if (pendingScroll.current) return;
    window.scrollTo({ top: scrollMemo.current[tab] || 0, behavior: 'instant' as ScrollBehavior });
  }, [tab]);

  if (!mounted) return <main className="min-h-screen" />;

  return (
    <>
      {showIntro && <IntroScreen onFinish={() => setShowIntro(false)} />}
      {toast}
      <div className="top-fade" aria-hidden />

      <main suppressHydrationWarning className="w-full max-w-[32rem] mx-auto min-h-screen relative select-none overflow-x-hidden" style={{ paddingBottom: 150 }}>
        <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {tab === 'home' && (
              <HomeTab
                rooms={rooms} loaded={roomsLoaded} error={fetchError} savedIds={savedIds}
                onSave={toggleSave} onOpen={markRoomSeen} onRetry={() => fetchRooms(0)}
                bestDrop={bestDrop} bestPoll={bestPoll}
              />
            )}
            {tab === 'add' && <AddTab value={newRoom} onChange={setNewRoom} onCreate={createRoom} busy={creating} />}
            {tab === 'saved' && (
              <SavedTab
                rooms={rooms} loaded={roomsLoaded} error={fetchError} savedIds={savedIds} lastSeenMap={lastSeenMap}
                onSave={toggleSave} onOpen={markRoomSeen} onRetry={() => fetchRooms(0)} onBrowse={() => changeTab('home')}
              />
            )}
            {tab === 'profile' && <ProfileTab avatarIndex={avatarIndex} onAvatar={pickAvatar} inbox={inbox} onOpenRoom={openInboxRoom} />}
        </motion.div>
      </main>

      <TabBar active={tab} onChange={changeTab} badge={inbox.length > 0 ? 'profile' : null} />
    </>
  );
}

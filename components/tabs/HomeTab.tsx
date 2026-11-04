"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, Download, X, Flame, ChartNoAxesColumn } from 'lucide-react';
import { Toolbar } from '@/components/SortMenu';
import { RoomGrid, EmptyState } from './shared';
import { applyRoomView, formatTime, type RoomFilter, type RoomSort } from '@/lib/rooms';

/* ── Today: best drop + top poll, as a quiet horizontal strip ── */
function TodayStrip({ bestDrop, bestPoll, onNavigate }: { bestDrop: any; bestPoll: any; onNavigate: () => void }) {
  const cards: React.ReactNode[] = [];
  const cw = bestDrop?.drop && bestPoll?.poll ? 'w-[90%]' : 'w-full';

  if (bestDrop?.drop) {
    const { drop, room } = bestDrop;
    cards.push(
      <Link key="drop" href={`/room/${room?.slug ?? ''}?drop=${String(drop._id).trim()}`} onClick={onNavigate}
        className={`tint-card press snap-start shrink-0 ${cw} rounded-[30px] p-5 flex flex-col`}
        style={{ ['--c' as any]: room?.color || '#c9c9d1' }}>
        <div className="flex items-center gap-1.5 mb-3.5 self-start rounded-full pl-2 pr-2.5 h-[24px] text-[11.5px] font-semibold uppercase whitespace-nowrap"
          style={{ background: 'rgba(255,255,255,0.65)', letterSpacing: '0.04em', boxShadow: '0 0 0 0.5px rgba(0,0,0,0.06)' }}>
          <Flame size={12} strokeWidth={2.4} /> Most popular drop today
        </div>
        <div className="flex items-center gap-2.5 mb-2.5">
          <img src={`/avatars/${drop.avatarIndex ?? 0}.png`} className="w-8 h-8 rounded-full" alt="" />
          <span className="text-[14px] font-semibold truncate" style={{ letterSpacing: '-0.01em' }}>{drop.tempName || 'Anonymous'}</span>
          <span className="ml-auto text-[13px]" style={{ color: 'var(--ink-2)' }}>{formatTime(drop.createdAt)}</span>
        </div>
        <p className="text-[17.5px] leading-[1.35] font-medium line-clamp-3 flex-1" style={{ letterSpacing: '-0.015em' }}>{drop.content}</p>
        <div className="flex items-center gap-1.5 mt-3.5 text-[14px] font-semibold" style={{ color: 'var(--ink-2)' }}>
          <Heart size={13} strokeWidth={2.2} /> {drop.likes?.length || 0}
          <span className="ml-auto truncate max-w-[50%]">{room?.title}</span>
        </div>
      </Link>
    );
  }

  if (bestPoll?.poll) {
    const { poll, room } = bestPoll;
    const total = poll.options?.reduce((s: number, o: any) => s + o.voters.length, 0) || 0;
    cards.push(
      <Link key="poll" href={`/room/${room?.slug ?? ''}`} onClick={onNavigate}
        className={`tint-card press snap-start shrink-0 ${cw} rounded-[30px] p-5 flex flex-col`}
        style={{ ['--c' as any]: room?.color || '#c9c9d1' }}>
        <div className="flex items-center gap-1.5 mb-3.5 self-start rounded-full pl-2 pr-2.5 h-[24px] text-[11.5px] font-semibold uppercase whitespace-nowrap"
          style={{ background: 'rgba(255,255,255,0.65)', letterSpacing: '0.04em', boxShadow: '0 0 0 0.5px rgba(0,0,0,0.06)' }}>
          <ChartNoAxesColumn size={12} strokeWidth={2.4} /> Top poll today
        </div>
        <p className="text-[17.5px] leading-[1.3] font-semibold line-clamp-2 mb-3" style={{ letterSpacing: '-0.02em' }}>{poll.question}</p>
        <div className="flex flex-col gap-1.5 flex-1">
          {poll.options?.slice(0, 3).map((opt: any, i: number) => {
            const pct = total > 0 ? Math.round((opt.voters.length / total) * 100) : 0;
            return (
              <div key={i} className="relative overflow-hidden rounded-full h-[32px] flex items-center px-3.5" style={{ background: 'rgba(255,255,255,0.55)' }}>
                <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.max(pct, 4)}%`, background: 'rgba(11,11,13,0.1)' }} />
                <span className="relative text-[14px] font-medium truncate">{opt.text}</span>
                <span className="relative ml-auto text-[13px] font-semibold pl-2" style={{ color: 'var(--ink-2)' }}>{pct}%</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3.5 text-[14px] font-semibold truncate" style={{ color: 'var(--ink-2)' }}>{room?.title}</div>
      </Link>
    );
  }

  if (!cards.length) return null;
  return (
    <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-pl-4 px-4 pt-5 pb-8 -mb-5">
      {cards}
    </div>
  );
}

/* ── PWA install nudge, kept tiny ── */
function InstallPill() {
  const [deferred, setDeferred] = useState<any>(null);
  const [ios, setIos] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) return;
    try { if (localStorage.getItem('installBannerDismissed')) return; } catch { return; }
    const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e); setShow(true); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', () => setShow(false));
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua) && /safari/.test(ua) && !/crios|fxios/.test(ua)) { setIos(true); setShow(true); }
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const dismiss = () => { setShow(false); try { localStorage.setItem('installBannerDismissed', '1'); } catch { /* ignore */ } };
  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null); setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          className="px-5 overflow-hidden"
        >
          <div className="glass rounded-full mt-4 pl-4 pr-2 h-[50px] flex items-center gap-2.5">
            <Download size={16} strokeWidth={2.1} />
            <span className="text-[15px] font-semibold flex-1 truncate" style={{ letterSpacing: '-0.01em' }}>
              {ios ? 'Share, then Add to Home Screen' : 'Add to Home Screen'}
            </span>
            {!ios && (
              <button onClick={install} className="press h-8 px-3.5 rounded-full text-[14px] font-semibold text-white" style={{ background: 'var(--ink)' }}>Install</button>
            )}
            <button onClick={dismiss} aria-label="Dismiss" className="press w-8 h-8 flex items-center justify-center" style={{ color: 'var(--ink-3)' }}>
              <X size={15} strokeWidth={2.6} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function HomeTab({
  rooms, loaded, error, savedIds, onSave, onOpen, onRetry, bestDrop, bestPoll,
}: {
  rooms: any[]; loaded: boolean; error: boolean; savedIds: string[];
  onSave: (id: string) => void; onOpen: (id: string) => void; onRetry: () => void;
  bestDrop: any; bestPoll: any;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<RoomFilter>('all');
  const [sort, setSort] = useState<RoomSort>('recent');
  const view = useMemo(() => applyRoomView(rooms, query, filter, sort), [rooms, query, filter, sort]);
  const browsing = query.trim() !== '' || filter !== 'all';

  return (
    <div>
      <header className="px-6 pb-6 flex justify-center" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 34px)' }}>
        <h1 className="text-[46px] leading-none font-bold select-none" style={{ letterSpacing: '-0.045em' }}>
          B<span className="mirror">L</span>ACKBOX
        </h1>
      </header>
      <Toolbar query={query} onQuery={setQuery} filter={filter} onFilter={setFilter} sort={sort} onSort={setSort} />
      <InstallPill />
      {!browsing && <TodayStrip bestDrop={bestDrop} bestPoll={bestPoll} onNavigate={() => onOpen('')} />}
      <RoomGrid
        rooms={view} loaded={loaded} error={error} savedIds={savedIds}
        onSave={onSave} onOpen={onOpen} onRetry={onRetry}
        empty={
          <EmptyState
            icon={<Search size={26} strokeWidth={1.8} />}
            title="No rooms found"
            action={browsing ? { label: 'Clear', onClick: () => { setQuery(''); setFilter('all'); } } : undefined}
          />
        }
      />
    </div>
  );
}

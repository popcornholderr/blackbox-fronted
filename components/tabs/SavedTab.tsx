"use client";
import { useMemo, useState } from 'react';
import { Bookmark, Search } from 'lucide-react';
import { Toolbar } from '@/components/SortMenu';
import { PageTitle, RoomGrid, EmptyState } from './shared';
import { applyRoomView, type RoomFilter, type RoomSort } from '@/lib/rooms';

export default function SavedTab({
  rooms, loaded, error, savedIds, lastSeenMap, onSave, onOpen, onRetry, onBrowse,
}: {
  rooms: any[]; loaded: boolean; error: boolean; savedIds: string[]; lastSeenMap: Record<string, number>;
  onSave: (id: string) => void; onOpen: (id: string) => void; onRetry: () => void; onBrowse: () => void;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<RoomFilter>('all');
  const [sort, setSort] = useState<RoomSort>('recent');

  const saved = useMemo(() => rooms.filter((r) => savedIds.includes(r._id)), [rooms, savedIds]);
  const view = useMemo(() => applyRoomView(saved, query, filter, sort), [saved, query, filter, sort]);
  const narrowed = query.trim() !== '' || filter !== 'all';

  return (
    <div>
      <PageTitle>Saved</PageTitle>
      <Toolbar query={query} onQuery={setQuery} filter={filter} onFilter={setFilter} sort={sort} onSort={setSort} />
      <RoomGrid
        rooms={view} loaded={loaded} error={error} savedIds={savedIds}
        onSave={onSave} onOpen={onOpen} onRetry={onRetry}
        newFlags={(r) => new Date(r.lastDropAt).getTime() > (lastSeenMap[r._id] || 0)}
        empty={
          saved.length === 0 ? (
            <EmptyState icon={<Bookmark size={26} strokeWidth={1.8} />} title="Nothing saved yet" action={{ label: 'Browse rooms', onClick: onBrowse }} />
          ) : (
            <EmptyState icon={<Search size={26} strokeWidth={1.8} />} title="No matches"
              action={narrowed ? { label: 'Clear', onClick: () => { setQuery(''); setFilter('all'); } } : undefined} />
          )
        }
      />
    </div>
  );
}

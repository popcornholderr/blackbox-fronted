"use client";
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Globe, Lock, ShieldCheck, Clock, Bookmark, LayoutGrid, Search, X } from 'lucide-react';
import { FILTER_OPTIONS, SORT_OPTIONS, type RoomFilter, type RoomSort } from '@/lib/rooms';

const FILTER_ICON: Record<RoomFilter, React.ReactNode> = {
  all: <LayoutGrid size={17} strokeWidth={1.8} />,
  public: <Globe size={17} strokeWidth={1.8} />,
  private: <Lock size={17} strokeWidth={1.8} />,
  safe: <ShieldCheck size={17} strokeWidth={1.8} />,
  adult: <span className="text-[11px] font-bold tracking-tight leading-none border-[1.5px] border-current rounded-[5px] px-[3px] py-[2px]">18+</span>,
};
const SORT_ICON: Record<RoomSort, React.ReactNode> = {
  recent: <Clock size={17} strokeWidth={1.8} />,
  popular: <Bookmark size={17} strokeWidth={1.8} />,
};

/** SF-style "line.3.horizontal.decrease" */
function SortGlyph() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <path d="M4 7h16M7 12h10M10 17h4" />
    </svg>
  );
}

function Row({ active, label, icon, onClick }: { active: boolean; label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center h-[50px] pl-3 pr-4 text-left active:bg-black/[0.06] transition-colors"
    >
      <span className="w-6 flex items-center justify-center">
        {active && <Check size={16} strokeWidth={2.6} />}
      </span>
      <span className="flex-1 text-[18px] font-medium ml-1.5">{label}</span>
      <span className="text-[color:var(--ink)] opacity-90 flex items-center">{icon}</span>
    </button>
  );
}

export default function SortMenu({
  filter, sort, onFilter, onSort,
}: {
  filter: RoomFilter; sort: RoomSort; onFilter: (f: RoomFilter) => void; onSort: (s: RoomSort) => void;
}) {
  const [open, setOpen] = useState(false);
  const dirty = filter !== 'all' || sort !== 'recent';

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Sort and filter"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="glass press w-[58px] h-[58px] rounded-full flex items-center justify-center"
      >
        <SortGlyph />
        {dirty && (
          <span className="absolute top-[9px] right-[9px] w-[7px] h-[7px] rounded-full" style={{ background: 'var(--ink)', boxShadow: '0 0 0 1.5px #fff', zIndex: 3 }} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
            <motion.div
              role="menu"
              initial={{ opacity: 0, scale: 0.86, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -6, transition: { duration: 0.14 } }}
              transition={{ type: 'spring', stiffness: 520, damping: 34 }}
              style={{ transformOrigin: 'top right' }}
              className="glass glass-strong absolute right-0 top-[calc(100%+10px)] z-[95] w-[264px] rounded-[26px] overflow-hidden"
            >
              <div className="py-1.5">
                {FILTER_OPTIONS.map((o) => (
                  <Row key={o.key} active={filter === o.key} label={o.label} icon={FILTER_ICON[o.key]}
                    onClick={() => { onFilter(o.key); setOpen(false); }} />
                ))}
              </div>
              <div className="h-[7px]" style={{ background: 'rgba(120,120,128,0.14)' }} />
              <div className="py-1.5">
                {SORT_OPTIONS.map((o) => (
                  <Row key={o.key} active={sort === o.key} label={o.label} icon={SORT_ICON[o.key]}
                    onClick={() => { onSort(o.key); setOpen(false); }} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SearchField({
  value, onChange, placeholder = 'Search',
}: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="glass flex items-center gap-2.5 h-[58px] px-5 rounded-full flex-1 min-w-0 cursor-text">
      <Search size={21} strokeWidth={2} style={{ color: 'var(--ink-2)' }} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 bg-transparent outline-none text-[20px] font-medium placeholder:text-[color:var(--ink-3)]"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
      />
      <AnimatePresence>
        {value && (
          <motion.button
            type="button"
            aria-label="Clear"
            initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
            onClick={(e) => { e.preventDefault(); onChange(''); }}
            className="w-[18px] h-[18px] rounded-full flex items-center justify-center"
            style={{ background: 'rgba(120,120,128,0.4)', color: '#fff' }}
          >
            <X size={11} strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>
    </label>
  );
}

export function Toolbar(props: {
  query: string; onQuery: (v: string) => void;
  filter: RoomFilter; onFilter: (f: RoomFilter) => void;
  sort: RoomSort; onSort: (s: RoomSort) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-5">
      <SearchField value={props.query} onChange={props.onQuery} placeholder={props.placeholder} />
      <SortMenu filter={props.filter} sort={props.sort} onFilter={props.onFilter} onSort={props.onSort} />
    </div>
  );
}

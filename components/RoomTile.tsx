"use client";
import { useCallback, memo, type CSSProperties } from 'react';
import { Bookmark, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Room tile. The only coloured thing in the app — and the colour is only
 * ever a pale, blurred wash. Private rooms get a small lock; nothing else.
 */
const RoomTile = memo(function RoomTile({
  room, isSaved, onSave, onOpen, hasNew,
}: {
  room: any; isSaved: boolean; onSave: () => void; onOpen?: () => void; hasNew?: boolean;
}) {
  const router = useRouter();

  const open = useCallback(() => {
    onOpen?.();
    router.push(`/room/${room.slug}`);
  }, [room.slug, onOpen, router]);

  const save = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSave();
  }, [onSave]);

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => { if (e.key === 'Enter') open(); }}
      className="tile aspect-square rounded-[34px] cursor-pointer select-none"
      style={{ ['--c' as any]: room.color || '#c9c9d1' } as CSSProperties}
    >
      <span className="blob a" />
      <span className="blob b" />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
        {room.isPrivate ? (
          <span className="glass w-[32px] h-[32px] rounded-full flex items-center justify-center" aria-label="Private">
            <Lock size={15} strokeWidth={2.3} />
          </span>
        ) : <span />}

        <button
          type="button"
          onClick={save}
          aria-label={isSaved ? 'Remove from saved' : 'Save'}
          aria-pressed={isSaved}
          className="press w-[36px] h-[36px] rounded-full flex items-center justify-center"
          style={{ color: 'var(--ink)' }}
        >
          <Bookmark size={21} strokeWidth={2} fill={isSaved ? 'currentColor' : 'none'} style={{ transition: 'fill .25s ease' }} />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
        <h3
          className="text-[23px] leading-[1.12] font-semibold line-clamp-2 break-words"
          style={{ letterSpacing: '-0.03em', color: 'var(--ink)' }}
        >
          {hasNew && (
            <span
              className="inline-block w-[7px] h-[7px] rounded-full mr-[7px] align-middle -translate-y-px"
              style={{ background: 'var(--ink)' }}
              aria-label="New activity"
            />
          )}
          {room.title}
        </h3>
      </div>
    </div>
  );
});

export default RoomTile;

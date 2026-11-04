export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/* ───────────── time ───────────── */
export function formatTime(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/* ───────────── room colour ─────────────
   New rooms get a soft, light hue. Tiles dilute it further, so even
   older, saturated rooms never look harsh. */
export function generateUniqueColor(): string {
  const h = (Math.random() * 360) % 360;
  const s = 50 + Math.random() * 25;
  const l = 62 + Math.random() * 12;
  const sl = s / 100;
  const ll = l / 100;
  const a = sl * Math.min(ll, 1 - ll);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/* ───────────── filtering / sorting ───────────── */
export type RoomFilter = 'all' | 'public' | 'private' | 'safe' | 'adult';
export type RoomSort = 'recent' | 'popular';

/* The labels live here so they are trivial to rename.
   The backend only stores isPrivate + isAdult, so "Sensitive" = isAdult. */
export const FILTER_OPTIONS: { key: RoomFilter; label: string }[] = [
  { key: 'all', label: 'All Rooms' },
  { key: 'public', label: 'Public' },
  { key: 'private', label: 'Private' },
  { key: 'safe', label: 'Safe' },
  { key: 'adult', label: '18+' },
];

export const SORT_OPTIONS: { key: RoomSort; label: string }[] = [
  { key: 'recent', label: 'Latest' },
  { key: 'popular', label: 'Most Saved' },
];

export function applyRoomView(rooms: any[], query: string, filter: RoomFilter, sort: RoomSort): any[] {
  const q = query.trim().toLowerCase();
  const out = rooms.filter((r) => {
    if (q && !String(r.title).toLowerCase().includes(q)) return false;
    switch (filter) {
      case 'public': return !r.isPrivate;
      case 'private': return !!r.isPrivate;
      case 'safe': return !r.isAdult;
      case 'adult': return !!r.isAdult;
      default: return true;
    }
  });
  const ts = (r: any) => new Date(r.lastDropAt || r.createdAt || 0).getTime();
  out.sort((a, b) =>
    sort === 'popular'
      ? (b.savedCount || 0) - (a.savedCount || 0) || ts(b) - ts(a)
      : ts(b) - ts(a)
  );
  return out;
}

/* ───────────── join-request inbox ─────────────
   The backend only exposes "status of THIS user for THIS room", so we
   remember the rooms we asked to join and poll those. When one flips to
   approved it lands in the inbox for 24h and the room is auto-saved. */
export const INBOX_TTL = 24 * 60 * 60 * 1000;
const KEY = 'joinRequests';

export type JoinRecord = {
  roomId: string;
  slug: string;
  title: string;
  color: string;
  requestedAt: number;
  status: 'pending' | 'approved';
  approvedAt?: number;
};

function read(): JoinRecord[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function write(list: JoinRecord[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage full / blocked */ }
}

export function trackJoinRequest(room: any) {
  const list = read();
  if (list.some((r) => r.roomId === room._id)) return;
  list.push({
    roomId: room._id, slug: room.slug, title: room.title, color: room.color,
    requestedAt: Date.now(), status: 'pending',
  });
  write(list);
}

/** Returns true when this call is the one that flipped the room to approved. */
export function markJoinApproved(room: any): boolean {
  const list = read();
  const hit = list.find((r) => r.roomId === room._id);
  if (hit) {
    if (hit.status === 'approved') return false;
    hit.status = 'approved';
    hit.approvedAt = Date.now();
  } else {
    list.push({
      roomId: room._id, slug: room.slug, title: room.title, color: room.color,
      requestedAt: Date.now(), status: 'approved', approvedAt: Date.now(),
    });
  }
  write(list);
  return true;
}

export function getInbox(): JoinRecord[] {
  const now = Date.now();
  return read()
    .filter((r) => r.status === 'approved' && r.approvedAt && now - r.approvedAt < INBOX_TTL)
    .sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0));
}

/** Syncs with the server's record of this user's join requests.
    Resolves with the records that were newly approved (within the 24h window). */
export async function refreshJoinRequests(userId: string): Promise<JoinRecord[]> {
  let rows: any[] = [];
  try {
    const res = await fetch(`${BASE_URL}/api/users/${userId}/join-requests`);
    if (!res.ok) return [];
    rows = await res.json();
    if (!Array.isArray(rows)) return [];
  } catch { return []; }

  const list = read();
  const newly: JoinRecord[] = [];
  let changed = false;

  for (const r of rows) {
    const i = list.findIndex((x) => x.roomId === r.roomId);
    const rec = i > -1 ? list[i] : undefined;

    if (r.status === 'approved' && r.approvedAt) {
      const at = Date.parse(r.approvedAt);
      const fresh = Date.now() - at < INBOX_TTL;
      if (!rec) {
        const nr: JoinRecord = { roomId: r.roomId, slug: r.slug, title: r.title, color: r.color, requestedAt: Date.parse(r.createdAt) || at, status: 'approved', approvedAt: at };
        list.push(nr); changed = true;
        if (fresh) newly.push(nr);
      } else if (rec.status !== 'approved') {
        rec.status = 'approved'; rec.approvedAt = at; rec.title = r.title; rec.color = r.color; changed = true;
        if (fresh) newly.push(rec);
      } else if (rec.approvedAt !== at) {
        rec.approvedAt = at; changed = true;
      }
    } else if (r.status === 'pending' && !rec) {
      list.push({ roomId: r.roomId, slug: r.slug, title: r.title, color: r.color, requestedAt: Date.parse(r.createdAt) || Date.now(), status: 'pending' });
      changed = true;
    } else if (r.status === 'denied' && rec && rec.status === 'pending') {
      list.splice(i, 1); changed = true;
    }
  }

  if (changed) write(list);
  return newly;
}

export function timeLeft(rec: JoinRecord): string {
  const ms = (rec.approvedAt || 0) + INBOX_TTL - Date.now();
  const h = Math.max(0, Math.ceil(ms / 3600000));
  return h <= 1 ? 'Under 1h' : `${h}h left`;
}

export function getUserId(): string {
  if (typeof window === 'undefined') return 'anon';
  let id = localStorage.getItem('userId');
  if (!id) {
    id = 'user-' + Math.random().toString(36).slice(2);
    localStorage.setItem('userId', id);
  }
  return id;
}

/** Adds a room to local saved + bumps the saved counter. Returns true if newly saved. */
export function autoSaveRoom(roomId: string): boolean {
  if (typeof window === 'undefined') return false;
  let saved: string[] = [];
  try { saved = JSON.parse(localStorage.getItem('savedRooms') || '[]'); } catch { /* ignore */ }
  if (saved.includes(roomId)) return false;
  saved.push(roomId);
  try { localStorage.setItem('savedRooms', JSON.stringify(saved)); } catch { /* ignore */ }
  fetch(`${BASE_URL}/api/rooms/${roomId}/save`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'increment' }),
  }).catch(() => {});
  return true;
}

/* ───────────── auth headers ─────────────
   X-User-Id lets the server recognise approved members of private rooms;
   the admin token (from the admin code) is kept per room for this session. */
export const adminKey = (slug: string) => `adminToken-${slug}`;

export function authHeaders(slug?: string): Record<string, string> {
  const h: Record<string, string> = { 'X-User-Id': getUserId() };
  if (slug) {
    try {
      const t = sessionStorage.getItem(adminKey(slug));
      if (t) h.Authorization = `Bearer ${t}`;
    } catch { /* storage blocked */ }
  }
  return h;
}

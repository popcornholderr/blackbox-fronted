"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, RotateCcw, Trophy, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/* ─── constants ─────────────────────────────────────────── */
const W = 390;
const H = 520;
const GROUND_Y = 400;
const CUBE_SIZE = 36;
const GRAVITY = 0.55;
const JUMP_FORCE = -13.5;
const DOUBLE_JUMP_FORCE = -12;
const BASE_SPEED = 5;

type ObstacleType = 'low' | 'tall' | 'floating' | 'double';
interface Obstacle {
  x: number; w: number; h: number; y: number;
  type: ObstacleType; color: string;
}
interface Particle {
  x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; r: number;
}

const LEVEL_CONFIG = Array.from({ length: 50 }, (_, i) => {
  const lvl = i + 1;
  return {
    speed: BASE_SPEED + lvl * 0.28,
    gap: Math.max(280, 520 - lvl * 4),
    obstacleTypes: lvl < 5 ? ['low'] : lvl < 12 ? ['low', 'tall'] : lvl < 22 ? ['low', 'tall', 'floating'] : ['low', 'tall', 'floating', 'double'],
    accentColor: ['#fac9f6', '#a78bfa', '#34d399', '#60a5fa', '#f87171', '#fbbf24', '#c084fc', '#2dd4bf', '#f472b6', '#818cf8'][Math.floor(lvl / 5) % 10],
  };
});

function getObstacle(lvl: number, startX: number): Obstacle {
  const cfg = LEVEL_CONFIG[Math.min(lvl - 1, 49)];
  const type = cfg.obstacleTypes[Math.floor(Math.random() * cfg.obstacleTypes.length)] as ObstacleType;
  const col = cfg.accentColor;
  switch (type) {
    case 'low': return { x: startX, w: 24, h: 32, y: GROUND_Y - 32, type, color: col };
    case 'tall': return { x: startX, w: 22, h: 58, y: GROUND_Y - 58, type, color: col };
    case 'floating': return { x: startX, w: 32, h: 18, y: GROUND_Y - 90 - Math.random() * 40, type, color: col };
    case 'double': return { x: startX, w: 20, h: 44, y: GROUND_Y - 44, type, color: col };
    default: return { x: startX, w: 24, h: 32, y: GROUND_Y - 32, type, color: col };
  }
}

function drawCube(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number, accent: string, jumping: boolean) {
  const s = size;
  const d = s * 0.3;
  ctx.save();
  ctx.translate(x + s / 2, y + s / 2);
  ctx.rotate(jumping ? rot * 0.08 : rot * 0.03);
  ctx.fillStyle = '#1a1a1a'; ctx.strokeStyle = accent; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.rect(-s / 2, -s / 2, s, s); ctx.fill(); ctx.stroke();
  // Top face
  ctx.beginPath();
  ctx.moveTo(-s / 2, -s / 2);
  ctx.lineTo(-s / 2 + d, -s / 2 - d);
  ctx.lineTo(s / 2 + d, -s / 2 - d);
  ctx.lineTo(s / 2, -s / 2);
  ctx.closePath();
  ctx.fillStyle = '#2a2a2a'; ctx.fill(); ctx.strokeStyle = accent + '88'; ctx.stroke();
  // Right face
  ctx.beginPath();
  ctx.moveTo(s / 2, -s / 2);
  ctx.lineTo(s / 2 + d, -s / 2 - d);
  ctx.lineTo(s / 2 + d, s / 2 - d);
  ctx.lineTo(s / 2, s / 2);
  ctx.closePath();
  ctx.fillStyle = '#131313'; ctx.fill(); ctx.strokeStyle = accent + '66'; ctx.stroke();
  ctx.restore();
}

export default function GamePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // Use a ref for uiState so the jump callback never has a stale closure
  const uiStateRef = useRef<'idle' | 'playing' | 'over'>('idle');

  const gameRef = useRef({
    running: false, over: false, started: false,
    cubeY: GROUND_Y - CUBE_SIZE, cubeVY: 0, jumping: false, doubleAvail: true,
    obstacles: [] as Obstacle[], particles: [] as Particle[],
    score: 0, dist: 0, level: 1, nextLevelDist: 500,
    spawnCooldown: 60, cubeRot: 0, bgOffset: 0,
    stars: [] as { x: number; y: number; r: number; op: number }[],
    scrollLines: [] as { x: number; speed: number; op: number }[],
  });

  const [uiState, setUiState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);

  // Keep the ref in sync with React state
  const setUiStateBoth = (s: 'idle' | 'playing' | 'over') => {
    uiStateRef.current = s;
    setUiState(s);
  };

  useEffect(() => {
    const hs = parseInt(localStorage.getItem('bbgame-hs') || '0');
    setHighScore(hs);
    const g = gameRef.current;
    g.stars = Array.from({ length: 30 }, () => ({
      x: Math.random() * W,
      y: Math.random() * (GROUND_Y - 60),
      r: Math.random() * 1.5 + 0.5,
      op: Math.random() * 0.6 + 0.2,
    }));
    g.scrollLines = Array.from({ length: 6 }, () => ({
      x: Math.random() * W,
      speed: Math.random() * 2 + 1,
      op: Math.random() * 0.08,
    }));
  }, []);

  // jump reads from gameRef and uiStateRef — never stale
  const jump = useCallback(() => {
    const g = gameRef.current;
    const currentUiState = uiStateRef.current;

    // Start game on first tap
    if (!g.started || currentUiState === 'idle') {
      g.started = true;
      g.running = true;
      g.cubeVY = JUMP_FORCE;
      g.jumping = true;
      g.doubleAvail = true;
      setUiStateBoth('playing');
      return;
    }

    if (g.over) return;

    if (!g.jumping) {
      g.cubeVY = JUMP_FORCE;
      g.jumping = true;
      g.doubleAvail = true;
    } else if (g.doubleAvail) {
      g.cubeVY = DOUBLE_JUMP_FORCE;
      g.doubleAvail = false;
    }
  }, []); // no deps — reads from refs only

  const resetGame = useCallback(() => {
    const g = gameRef.current;
    g.running = false;
    g.over = false;
    g.started = false;
    g.cubeY = GROUND_Y - CUBE_SIZE;
    g.cubeVY = 0;
    g.jumping = false;
    g.doubleAvail = true;
    g.obstacles = [];
    g.particles = [];
    g.score = 0;
    g.dist = 0;
    g.level = 1;
    g.nextLevelDist = 500;
    g.spawnCooldown = 60;
    g.cubeRot = 0;
    g.bgOffset = 0;
    setScore(0);
    setLevel(1);
    setUiStateBoth('idle');
  }, []);

  // Keyboard support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const g = gameRef.current;
      const cfg = LEVEL_CONFIG[Math.min(g.level - 1, 49)];

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      // Stars
      g.stars.forEach(s => {
        s.x -= 0.2;
        if (s.x < 0) s.x = W;
        ctx.fillStyle = `rgba(255,255,255,${s.op})`;
        ctx.fillRect(s.x, s.y, s.r, s.r);
      });

      // Scroll lines
      g.scrollLines.forEach(l => {
        if (!g.running) return;
        l.x -= l.speed * (cfg.speed / BASE_SPEED);
        if (l.x < 0) l.x = W + 20;
        ctx.strokeStyle = `rgba(255,255,255,${l.op})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(l.x, 0);
        ctx.lineTo(l.x - 60, GROUND_Y);
        ctx.stroke();
      });

      // Ground
      ctx.fillStyle = '#111';
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      ctx.shadowColor = cfg.accentColor;
      ctx.shadowBlur = 6;
      ctx.strokeStyle = cfg.accentColor + '60';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(W, GROUND_Y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (g.running && !g.over) {
        g.bgOffset += cfg.speed;
        g.cubeVY += GRAVITY;
        g.cubeY += g.cubeVY;
        if (g.cubeY >= GROUND_Y - CUBE_SIZE) {
          g.cubeY = GROUND_Y - CUBE_SIZE;
          g.cubeVY = 0;
          g.jumping = false;
          g.doubleAvail = true;
        }
        g.cubeRot += 2;
        g.dist += cfg.speed;
        g.score = Math.floor(g.dist / 10);

        g.spawnCooldown--;
        if (g.spawnCooldown <= 0) {
          g.obstacles.push(getObstacle(g.level, W + 20));
          g.spawnCooldown = cfg.gap / cfg.speed;
        }

        g.obstacles = g.obstacles.filter(o => o.x + o.w > -10);
        g.obstacles.forEach(o => { o.x -= cfg.speed; });

        // Level up
        if (g.dist > g.nextLevelDist && g.level < 50) {
          g.level++;
          g.nextLevelDist += 600 + g.level * 60;
          setLevel(g.level);
        }

        setScore(g.score);

        // Collision
        const cx = 36, cy = g.cubeY, cs = CUBE_SIZE;
        for (const o of g.obstacles) {
          if (
            cx + cs - 4 > o.x + 3 &&
            cx + 4 < o.x + o.w - 3 &&
            cy + cs - 4 > o.y + 3 &&
            cy + 4 < o.y + o.h - 3
          ) {
            g.over = true;
            g.running = false;
            setUiStateBoth('over');
            const hs = parseInt(localStorage.getItem('bbgame-hs') || '0');
            if (g.score > hs) {
              localStorage.setItem('bbgame-hs', String(g.score));
              setHighScore(g.score);
            }
            break;
          }
        }
      }

      // Draw obstacles
      g.obstacles.forEach(o => {
        ctx.shadowColor = o.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#111';
        ctx.strokeStyle = o.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(o.x, o.y, o.w, o.h, 4);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Draw player
      ctx.shadowColor = cfg.accentColor;
      ctx.shadowBlur = 12;
      drawCube(ctx, 36, g.cubeY, CUBE_SIZE, g.cubeRot, cfg.accentColor, g.jumping);
      ctx.shadowBlur = 0;

      // HUD
      if (g.started) {
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = cfg.accentColor;
        ctx.textAlign = 'right';
        ctx.fillText(`LVL ${g.level}`, W - 16, 28);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '11px monospace';
        ctx.fillText(`${g.score}`, W - 16, 46);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleTap = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    // Don't jump if tapping a button (e.g. Retry)
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    jump();
  }, [jump]);

  return (
    <main className="min-h-screen bg-black flex flex-col items-center touch-none overflow-hidden">
      <header className="w-full max-w-md p-4 flex items-center justify-between border-b border-white/10 z-50 bg-black">
        <button onClick={() => router.back()} className="p-2 bg-zinc-900 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-black uppercase italic">BlackBox Runner</h1>
          <p className="text-[10px] text-white/30 font-bold uppercase">Tap to Jump</p>
        </div>
        <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1 rounded-lg">
          <Trophy size={12} className="text-yellow-500" />
          <span className="text-xs font-black">{highScore}</span>
        </div>
      </header>

      <div
        className="relative mt-8"
        style={{
          width: W,
          height: H,
          touchAction: 'none',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
        onPointerDown={handleTap}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="rounded-3xl border border-white/10"
          style={{ display: 'block' }}
        />

        {uiState === 'idle' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl p-6 text-center pointer-events-none">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl border border-white/10 mb-4 flex items-center justify-center">
              <Image src="/logo 2.png" alt="logo" width={40} height={40} />
            </div>
            <h2 className="text-2xl font-black italic uppercase mb-2">Ready?</h2>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Tap anywhere to start</p>
          </div>
        )}

        {uiState === 'over' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center rounded-3xl p-6 z-[100]">
            <motion.div animate={{ rotate: [0, -5, 5, -3, 0] }} transition={{ duration: 0.5 }} className="text-4xl mb-4">💥</motion.div>
            <h2 className="text-3xl font-black italic uppercase text-red-500 mb-6">Crashed!</h2>
            <div className="flex gap-4 mb-8">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase text-white/30">Score</p>
                <p className="text-2xl font-black">{score}</p>
              </div>
              <div className="text-center border-l border-white/10 pl-4">
                <p className="text-[10px] font-black uppercase text-white/30">Best</p>
                <p className="text-2xl font-black">{highScore}</p>
              </div>
            </div>
            <button
              onPointerDown={(e) => { e.stopPropagation(); resetGame(); }}
              className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} /> Retry
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 text-[10px] font-black uppercase text-white/20 tracking-[0.2em]">
        Tap = Jump · Double tap = Double jump
      </div>
    </main>
  );
}

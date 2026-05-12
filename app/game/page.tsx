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
  const s = size; const d = s * 0.3;
  ctx.save();
  ctx.translate(x + s / 2, y + s / 2);
  ctx.rotate(jumping ? rot * 0.08 : rot * 0.03);
  ctx.fillStyle = '#1a1a1a'; ctx.strokeStyle = accent; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.rect(-s / 2, -s / 2, s, s); ctx.fill(); ctx.stroke();
  ctx.restore();
}

export default function GamePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const gameRef = useRef({
    running: false, over: false, started: false,
    cubeY: GROUND_Y - CUBE_SIZE, cubeVY: 0, jumping: false, doubleAvail: true,
    obstacles: [] as Obstacle[], particles: [] as Particle[],
    score: 0, dist: 0, level: 1, nextLevelDist: 500,
    spawnCooldown: 0, cubeRot: 0, bgOffset: 0,
    stars: [] as any[], scrollLines: [] as any[],
  });

  const [uiState, setUiState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    const hs = parseInt(localStorage.getItem('bbgame-hs') || '0');
    setHighScore(hs);
    const g = gameRef.current;
    g.stars = Array.from({ length: 30 }, () => ({ x: Math.random() * W, y: Math.random() * (GROUND_Y - 60), r: Math.random() * 1.5 + 0.5, op: Math.random() * 0.6 + 0.2 }));
    g.scrollLines = Array.from({ length: 6 }, () => ({ x: Math.random() * W, speed: Math.random() * 2 + 1, op: Math.random() * 0.08 }));
  }, []);

  const jump = useCallback(() => {
  const g = gameRef.current;
  
  // This handles the "Tap to Start" transition
  if (!g.started || uiState === 'idle') {
    g.started = true;
    g.running = true;
    setUiState('playing');
    // Optional: add a tiny initial jump so it feels responsive
    g.cubeVY = JUMP_FORCE; 
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
}, [uiState]); // Add uiState to dependencies

  const resetGame = () => {
    const g = gameRef.current;
    g.running = true; g.over = false; g.started = true;
    g.cubeY = GROUND_Y - CUBE_SIZE; g.cubeVY = 0; g.jumping = false;
    g.obstacles = []; g.particles = []; g.score = 0; g.dist = 0;
    g.level = 1; g.spawnCooldown = 60;
    setScore(0); setLevel(1); setUiState('playing');
  };

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
        s.x -= 0.2; if (s.x < 0) s.x = W;
        ctx.fillStyle = `rgba(255,255,255,${s.op})`;
        ctx.fillRect(s.x, s.y, s.r, s.r);
      });

      // Ground
      ctx.fillStyle = '#111';
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      ctx.strokeStyle = cfg.accentColor + '60';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(W, GROUND_Y); ctx.stroke();

      if (g.running && !g.over) {
        g.cubeVY += GRAVITY;
        g.cubeY += g.cubeVY;
        if (g.cubeY >= GROUND_Y - CUBE_SIZE) {
          g.cubeY = GROUND_Y - CUBE_SIZE; g.cubeVY = 0; g.jumping = false; g.doubleAvail = true;
        }
        g.cubeRot += 2;
        g.dist += cfg.speed;
        g.score = Math.floor(g.dist / 10);
        
        g.spawnCooldown--;
        if (g.spawnCooldown <= 0) {
          g.obstacles.push(getObstacle(g.level, W + 20));
          g.spawnCooldown = cfg.gap / cfg.speed;
        }

        g.obstacles.forEach(o => {
          o.x -= cfg.speed;
          // Collision
          const cx = 36, cy = g.cubeY, cs = CUBE_SIZE;
          if (cx < o.x + o.w && cx + cs > o.x && cy < o.y + o.h && cy + cs > o.y) {
            g.over = true; g.running = false;
            setUiState('over');
            const hs = parseInt(localStorage.getItem('bbgame-hs') || '0');
            if (g.score > hs) localStorage.setItem('bbgame-hs', String(g.score));
          }
        });
        g.obstacles = g.obstacles.filter(o => o.x > -50);
        
        if (g.score % 50 === 0 && g.score > 0 && g.level < 50) {
           // Basic level up logic
        }
        setScore(g.score);
      }

      // Draw Obstacles
      g.obstacles.forEach(o => {
        ctx.fillStyle = '#111'; ctx.strokeStyle = o.color;
        ctx.beginPath(); ctx.roundRect(o.x, o.y, o.w, o.h, 4); ctx.fill(); ctx.stroke();
      });

      // Draw Player
      drawCube(ctx, 36, g.cubeY, CUBE_SIZE, g.cubeRot, cfg.accentColor, g.jumping);

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <main className="min-h-screen bg-black flex flex-col items-center touch-none overflow-hidden">
      <header className="w-full max-w-md p-4 flex items-center justify-between border-b border-white/10 z-50 bg-black">
        <button onClick={() => router.back()} className="p-2 bg-zinc-900 rounded-xl"><ArrowLeft size={20} /></button>
        <div className="text-center">
            <h1 className="text-sm font-black uppercase italic">BlackBox Runner</h1>
            <p className="text-[10px] text-white/30 font-bold uppercase">Tap to Jump</p>
        </div>
        <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1 rounded-lg">
          <Trophy size={12} className="text-yellow-500" />
          <span className="text-xs font-black">{highScore}</span>
        </div>
      </header>

      <motion.div 
  className="relative mt-8 flex items-center justify-center"
  style={{ 
    width: W, 
    height: H, 
    touchAction: 'none', // Prevents browser pull-to-refresh
    userSelect: 'none',  // Prevents text selection highlighting
    WebkitTapHighlightColor: 'transparent' // Removes the blue flash on tap
  }}
  // Use capture phase to ensure the jump fires before drag logic intercepts
  onPointerDownCapture={(e) => {
    // Only jump if we aren't clicking a button (like Retry)
    if ((e.target as HTMLElement).tagName !== 'BUTTON') {
      jump();
    }
  }}
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.1}
  onDragEnd={(_, info) => { 
    // Increased threshold to 100 to prevent accidental exits during fast gameplay
    if (info.offset.x > 100) router.push('/?tab=browse'); 
  }}
>
        <canvas ref={canvasRef} width={W} height={H} className="rounded-3xl border border-white/10" />

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
      </motion.div>

      <div className="mt-8 text-[10px] font-black uppercase text-white/20 tracking-[0.2em]">
        Swipe Right to Exit
      </div>
    </main>
  );
}

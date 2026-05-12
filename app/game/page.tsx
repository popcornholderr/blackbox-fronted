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

/* level config */
const LEVEL_CONFIG = Array.from({ length: 50 }, (_, i) => {
  const lvl = i + 1;
  return {
    speed: BASE_SPEED + lvl * 0.28,
    gap: Math.max(280, 520 - lvl * 4),
    obstacleTypes: lvl < 5
      ? ['low'] as ObstacleType[]
      : lvl < 12
        ? ['low', 'tall'] as ObstacleType[]
        : lvl < 22
          ? ['low', 'tall', 'floating'] as ObstacleType[]
          : ['low', 'tall', 'floating', 'double'] as ObstacleType[],
    bgStars: 20 + lvl * 3,
    accentColor: [
      '#fac9f6', '#a78bfa', '#34d399', '#60a5fa', '#f87171',
      '#fbbf24', '#c084fc', '#2dd4bf', '#f472b6', '#818cf8',
    ][Math.floor(lvl / 5) % 10],
  };
});

function getObstacle(lvl: number, startX: number): Obstacle {
  const cfg = LEVEL_CONFIG[Math.min(lvl - 1, 49)];
  const type = cfg.obstacleTypes[Math.floor(Math.random() * cfg.obstacleTypes.length)];
  const col = cfg.accentColor;
  switch (type) {
    case 'low': return { x: startX, w: 24, h: 32, y: GROUND_Y - 32, type, color: col };
    case 'tall': return { x: startX, w: 22, h: 58, y: GROUND_Y - 58, type, color: col };
    case 'floating': return { x: startX, w: 32, h: 18, y: GROUND_Y - 90 - Math.random() * 40, type, color: col };
    case 'double': return { x: startX, w: 20, h: 44, y: GROUND_Y - 44, type, color: col };
    default: return { x: startX, w: 24, h: 32, y: GROUND_Y - 32, type, color: col };
  }
}

/* draw 3D cube on canvas */
function drawCube(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number, accent: string, jumping: boolean) {
  const s = size;
  const d = s * 0.3;
  ctx.save();
  ctx.translate(x + s / 2, y + s / 2);
  ctx.rotate(jumping ? rot * 0.08 : rot * 0.03);

  ctx.fillStyle = '#1a1a1a';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(-s / 2, -s / 2, s, s);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-s / 2, -s / 2);
  ctx.lineTo(-s / 2 + d, -s / 2 - d);
  ctx.lineTo(s / 2 + d, -s / 2 - d);
  ctx.lineTo(s / 2, -s / 2);
  ctx.closePath();
  ctx.fillStyle = '#2a2a2a';
  ctx.fill();
  ctx.strokeStyle = accent + '88';
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(s / 2, -s / 2);
  ctx.lineTo(s / 2 + d, -s / 2 - d);
  ctx.lineTo(s / 2 + d, s / 2 - d);
  ctx.lineTo(s / 2, s / 2);
  ctx.closePath();
  ctx.fillStyle = '#131313';
  ctx.fill();
  ctx.strokeStyle = accent + '66';
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(-s / 2 + 3, -s / 2 + 3, s - 6, s - 6);
  ctx.strokeStyle = accent + '44';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

/* ─── main component ────────────────────────────────────── */
export default function GamePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const gameRef = useRef({
    running: false, over: false, started: false,
    cubeY: GROUND_Y - CUBE_SIZE,
    cubeVY: 0,
    jumping: false, doubleAvail: true,
    obstacles: [] as Obstacle[],
    particles: [] as Particle[],
    score: 0, dist: 0,
    level: 1, nextLevelDist: 500,
    spawnCooldown: 0,
    cubeRot: 0,
    bgOffset: 0,
    stars: [] as { x: number; y: number; r: number; op: number }[],
    scrollLines: [] as { x: number; speed: number; op: number }[],
  });

  const [uiState, setUiState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef(1);

  const accentColor = useCallback(() => LEVEL_CONFIG[Math.min(gameRef.current.level - 1, 49)].accentColor, []);

  useEffect(() => {
    const hs = parseInt(localStorage.getItem('bbgame-hs') || '0');
    setHighScore(hs);

    const g = gameRef.current;
    g.stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * (GROUND_Y - 60),
      r: Math.random() * 1.5 + 0.5, op: Math.random() * 0.6 + 0.2,
    }));
    g.scrollLines = Array.from({ length: 8 }, () => ({
      x: Math.random() * W, speed: Math.random() * 2 + 1, op: Math.random() * 0.12 + 0.04,
    }));
  }, []);

  const jump = useCallback(() => {
    const g = gameRef.current;
    if (!g.started) {
      g.started = true; g.running = true;
      setUiState('playing');
    }
    if (g.over) return;
    if (!g.jumping) {
      g.cubeVY = JUMP_FORCE; g.jumping = true; g.doubleAvail = true;
      spawnJumpParticles();
    } else if (g.doubleAvail) {
      g.cubeVY = DOUBLE_JUMP_FORCE; g.doubleAvail = false;
      spawnJumpParticles();
    }
  }, []);

  const spawnJumpParticles = () => {
    const g = gameRef.current;
    const acc = LEVEL_CONFIG[Math.min(g.level - 1, 49)].accentColor;
    for (let i = 0; i < 8; i++) {
      g.particles.push({
        x: 36 + CUBE_SIZE / 2, y: g.cubeY + CUBE_SIZE,
        vx: (Math.random() - 0.5) * 3, vy: Math.random() * 2 + 1,
        life: 1, maxLife: 1, color: acc, r: Math.random() * 3 + 1,
      });
    }
  };

  const resetGame = useCallback(() => {
    const g = gameRef.current;
    g.running = false; g.over = false; g.started = false;
    g.cubeY = GROUND_Y - CUBE_SIZE; g.cubeVY = 0;
    g.jumping = false; g.doubleAvail = true;
    g.obstacles = []; g.particles = [];
    g.score = 0; g.dist = 0; g.level = 1; g.nextLevelDist = 500;
    g.spawnCooldown = 180;
    g.cubeRot = 0; g.bgOffset = 0;
    prevLevelRef.current = 1;
    setScore(0); setLevel(1); setUiState('idle');
  }, []);

  /* game loop */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const loop = () => {
      const g = gameRef.current;
      const cfg = LEVEL_CONFIG[Math.min(g.level - 1, 49)];
      const spd = cfg.speed;
      const acc = cfg.accentColor;

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      g.stars.forEach(s => {
        s.x -= 0.3;
        if (s.x < 0) { s.x = W; s.y = Math.random() * (GROUND_Y - 60); }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.op})`;
        ctx.fill();
      });

      g.scrollLines.forEach(l => {
        if (!g.running) return;
        l.x -= l.speed * (spd / BASE_SPEED);
        if (l.x < 0) { l.x = W + 20; }
        ctx.strokeStyle = `rgba(255,255,255,${l.op})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(l.x, 0); ctx.lineTo(l.x - 60, GROUND_Y);
        ctx.stroke();
      });

      ctx.fillStyle = '#111';
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      ctx.shadowColor = acc;
      ctx.shadowBlur = 6;
      ctx.strokeStyle = acc + '60';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(W, GROUND_Y); ctx.stroke();
      ctx.shadowBlur = 0;

      const gx = ((g.bgOffset * 0.5) % 60);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 0.5;
      for (let i = -60; i < W + 60; i += 60) {
        ctx.beginPath(); ctx.moveTo(i - gx, GROUND_Y); ctx.lineTo(i - gx, H); ctx.stroke();
      }

      if (g.running && !g.over) {
        g.bgOffset += spd;

        g.cubeVY += GRAVITY;
        g.cubeY += g.cubeVY;
        if (g.cubeY >= GROUND_Y - CUBE_SIZE) {
          g.cubeY = GROUND_Y - CUBE_SIZE; g.cubeVY = 0; g.jumping = false; g.doubleAvail = true;
        }
        g.cubeRot += 2;

        g.spawnCooldown--;
        if (g.spawnCooldown <= 0 && g.obstacles.length < 4) {
          g.obstacles.push(getObstacle(g.level, W + 40));
          const last = g.obstacles[g.obstacles.length - 1];
          if (last.type === 'double') {
            g.obstacles.push({ ...getObstacle(g.level, W + 40 + last.w + 28), type: 'low', color: acc });
          }
          g.spawnCooldown = cfg.gap / spd;
        }

        g.obstacles = g.obstacles.filter(o => o.x + o.w > -10);
        g.obstacles.forEach(o => { o.x -= spd; });

        g.dist += spd;
        g.score = Math.floor(g.dist / 10);

        if (g.dist > g.nextLevelDist && g.level < 50) {
          g.level++;
          g.nextLevelDist += 600 + g.level * 60;
          if (g.level !== prevLevelRef.current) {
            prevLevelRef.current = g.level;
            setLevel(g.level);
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 1500);
          }
        }
        setScore(g.score);

        g.particles = g.particles.filter(p => p.life > 0);
        g.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.05; });

        const cx = 36, cy = g.cubeY, cw = CUBE_SIZE, ch = CUBE_SIZE;
        for (const o of g.obstacles) {
          if (cx + cw - 4 > o.x + 3 && cx + 4 < o.x + o.w - 3 && cy + ch - 4 > o.y + 3 && cy + 4 < o.y + o.h - 3) {
            g.over = true; g.running = false;
            for (let i = 0; i < 20; i++) {
              g.particles.push({ x: cx + cw / 2, y: cy + ch / 2, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 1, maxLife: 1, color: acc, r: Math.random() * 4 + 1 });
            }
            const hs = parseInt(localStorage.getItem('bbgame-hs') || '0');
            if (g.score > hs) { localStorage.setItem('bbgame-hs', String(g.score)); setHighScore(g.score); }
            setUiState('over');
            break;
          }
        }
      }

      g.obstacles.forEach(o => {
        ctx.shadowColor = o.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#111';
        ctx.strokeStyle = o.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(o.x, o.y, o.w, o.h, 4);
        ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = o.color + '44';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.roundRect(o.x + 3, o.y + 3, o.w - 6, o.h - 6, 2); ctx.stroke();
      });

      ctx.shadowColor = acc; ctx.shadowBlur = 12;
      drawCube(ctx, 36, g.cubeY, CUBE_SIZE, g.cubeRot, acc, g.jumping);
      ctx.shadowBlur = 0;

      g.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
      });
      ctx.globalAlpha = 1;

      if (g.started) {
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = acc;
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

  /* keyboard input */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump]);

  const handleTap = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault(); jump();
  }, [jump]);

  // ── SWIPE HANDLER ──
  // Chain: /intro ← browse ← saved ← /game
  // Swipe RIGHT = go back to browse tab on home page
  // Swipe LEFT  = already at rightmost edge, do nothing
  const handleSwipe = useCallback((_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const isSwipe = Math.abs(info.offset.x) > 50 || Math.abs(info.velocity.x) > 300;
    if (!isSwipe) return;
    if (info.offset.x > 0) {
      // Swipe RIGHT → go back to browse tab
      cancelAnimationFrame(rafRef.current);
      router.push('/?tab=browse');
    }
    // Swipe LEFT on game page = rightmost edge, no action
  }, [router]);

  return (
    <main className="min-h-screen bg-black flex flex-col items-center select-none">
      {/* HEADER */}
      <header className="w-full max-w-md px-6 pt-6 pb-3 flex items-center gap-4 bg-black/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <button onClick={() => { cancelAnimationFrame(rafRef.current); router.back(); }} className="p-2 border border-white/20 rounded-xl bg-black">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-lg border border-white/20 bg-black flex items-center justify-center overflow-hidden">
            <Image src="/logo 2.png" alt="BB" width={20} height={20} className="object-contain" />
          </div>
          <div>
            <h1 className="text-base font-black uppercase italic tracking-tight text-white leading-none">BlackBox Runner</h1>
            <p className="text-[8px] font-bold uppercase text-white/30 tracking-widest">Tap to jump · Double-tap to double jump</p>
          </div>
        </div>
        {/* high score */}
        <div className="flex items-center gap-1.5 border border-white/10 rounded-xl px-3 py-1.5 bg-white/5">
          <Trophy size={11} className="text-[#fbbf24]" />
          <span className="text-[10px] font-black text-white/70">{highScore}</span>
        </div>
      </header>

      {/* GAME AREA — wrapped in motion.div for swipe gesture */}
      <motion.div
  className="relative mt-4"
  style={{ width: W, height: H }}
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.1}
  dragDirectionLock
  onDragEnd={handleSwipe}
  onPointerDown={(e) => {
    // If user taps/clicks directly on the canvas, trigger jump immediately
    if ((e.target as HTMLElement).tagName === "CANVAS") {
      jump();
    }
  }}
>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ display: 'block', touchAction: 'none', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
          onTouchStart={handleTap}
          onClick={handleTap}
        />

        {/* IDLE overlay */}
        <AnimatePresence>
          {uiState === 'idle' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ borderRadius: '1.5rem', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            >
              <motion.div
                animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-[1.5rem] border-2 border-white/20 bg-[#111] flex items-center justify-center mb-6 overflow-hidden"
                style={{ boxShadow: '0 0 30px rgba(250,201,246,0.2)' }}
              >
                <Image src="/logo 2.png" alt="BB" width={52} height={52} className="object-contain" />
              </motion.div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white mb-1">BlackBox Runner</h2>
              <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest mb-8">50 levels · tap to start</p>
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.4, repeat: Infinity }}
                className="text-[13px] font-black uppercase tracking-[0.3em] text-white/60">
                TAP / SPACE to start
              </motion.div>
              {/* Swipe hint */}
              <motion.div
                className="absolute bottom-5 right-5 flex items-center gap-1"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
              >
                <motion.span className="text-[9px] font-black uppercase text-white/20" animate={{ x: [-3, 0, -3] }} transition={{ duration: 1.2, repeat: Infinity }}>←</motion.span>
                <span className="text-[9px] font-black uppercase text-white/20 tracking-widest">swipe right to go back</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GAME OVER overlay */}
        <AnimatePresence>
          {uiState === 'over' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4"
              style={{ borderRadius: '1.5rem', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
            >
              <motion.div animate={{ rotate: [0, -5, 5, -3, 0] }} transition={{ duration: 0.5 }}
                className="text-4xl mb-2">💥</motion.div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Game Over</h2>

              <div className="grid grid-cols-3 gap-3 w-64">
                {[
                  { label: 'Score', val: score, icon: '⚡' },
                  { label: 'Level', val: level, icon: '🎯' },
                  { label: 'Best', val: highScore, icon: '🏆' },
                ].map(({ label, val, icon }) => (
                  <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-2xl border border-white/10 bg-white/5">
                    <span className="text-lg">{icon}</span>
                    <span className="text-base font-black text-white">{val}</span>
                    <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">{label}</span>
                  </div>
                ))}
              </div>

              {score >= highScore && score > 0 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#fbbf24]/40 bg-[#fbbf24]/10">
                  <Trophy size={12} className="text-[#fbbf24]" />
                  <span className="text-[10px] font-black uppercase text-[#fbbf24] tracking-widest">New High Score!</span>
                </motion.div>
              )}

              <button
                onClick={resetGame}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-zinc-100 active:scale-95 transition-all mt-2"
              >
                <RotateCcw size={16} />
                Play Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LEVEL UP toast */}
        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.85 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-black/80 backdrop-blur-sm"
              style={{ zIndex: 50 }}
            >
              <Zap size={12} className="text-[#fbbf24]" />
              <span className="text-[11px] font-black uppercase tracking-widest text-white">Level {level}!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* live score bar while playing */}
        {uiState === 'playing' && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-4 py-2 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: LEVEL_CONFIG[Math.min(level - 1, 49)].accentColor }} />
              <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">Lvl {level}</span>
            </div>
            <span className="text-[11px] font-black text-white/70 font-mono">{score}</span>
            <div className="flex items-center gap-1.5">
              <Trophy size={10} className="text-[#fbbf24]/60" />
              <span className="text-[10px] font-black text-white/35 font-mono">{highScore}</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* controls hint */}
      <div className="mt-4 flex items-center gap-6 text-[9px] font-black uppercase text-white/20 tracking-widest">
        <span>TAP / CLICK = Jump</span>
        <span>·</span>
        <span>Double tap = Double jump</span>
        <span>·</span>
        <span>SPACE / ↑</span>
      </div>

      {/* level progress */}
      {uiState === 'playing' && (
        <div className="mt-3 w-full max-w-md px-6">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: LEVEL_CONFIG[Math.min(level - 1, 49)].accentColor }}
              animate={{ width: `${(level / 50) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] font-black uppercase text-white/20">Level {level}/50</span>
            <span className="text-[8px] font-black uppercase text-white/20">{Math.round((level / 50) * 100)}%</span>
          </div>
        </div>
      )}
    </main>
  );
}

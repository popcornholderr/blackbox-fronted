"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, Trophy, RotateCcw } from "lucide-react";
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
const CROUCH_HEIGHT = 20;
const BASE_SPEED = 5;

type ObstacleType = 'low' | 'tall' | 'floating' | 'double' | 'wide' | 'gap' | 'stalactite';
interface Obstacle {
  x: number; w: number; h: number; y: number;
  type: ObstacleType; color: string;
}
interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; color: string; r: number;
}
interface PowerUp {
  x: number; y: number; type: 'shield' | 'slow'; collected: boolean;
}

const LEVEL_CONFIG = Array.from({ length: 50 }, (_, i) => {
  const lvl = i + 1;
  return {
    speed: BASE_SPEED + lvl * 0.28,
    gap: Math.max(260, 520 - lvl * 4),
    obstacleTypes: (
      lvl < 5  ? ['low'] :
      lvl < 10 ? ['low', 'tall'] :
      lvl < 16 ? ['low', 'tall', 'wide'] :
      lvl < 22 ? ['low', 'tall', 'wide', 'floating'] :
      lvl < 30 ? ['low', 'tall', 'wide', 'floating', 'stalactite'] :
                 ['low', 'tall', 'wide', 'floating', 'stalactite', 'double']
    ) as ObstacleType[],
    accentColor: [
      '#fac9f6','#a78bfa','#34d399','#60a5fa',
      '#f87171','#fbbf24','#c084fc','#2dd4bf',
      '#f472b6','#818cf8',
    ][Math.floor(lvl / 5) % 10],
  };
});

function getObstacle(lvl: number, startX: number): Obstacle {
  const cfg = LEVEL_CONFIG[Math.min(lvl - 1, 49)];
  const type = cfg.obstacleTypes[Math.floor(Math.random() * cfg.obstacleTypes.length)];
  const col = cfg.accentColor;
  switch (type) {
    case 'low':        return { x: startX, w: 24, h: 32, y: GROUND_Y - 32, type, color: col };
    case 'tall':       return { x: startX, w: 22, h: 64, y: GROUND_Y - 64, type, color: col };
    case 'wide':       return { x: startX, w: 52, h: 24, y: GROUND_Y - 24, type, color: col };
    case 'floating':   return { x: startX, w: 36, h: 16, y: GROUND_Y - 95 - Math.random() * 50, type, color: col };
    case 'stalactite': return { x: startX, w: 18, h: 44, y: 0, type, color: col }; // hangs from top
    case 'double':     return { x: startX, w: 20, h: 44, y: GROUND_Y - 44, type, color: col };
    default:           return { x: startX, w: 24, h: 32, y: GROUND_Y - 32, type, color: col };
  }
}

function drawCube(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  rot: number, accent: string, jumping: boolean, crouching: boolean
) {
  const d = Math.min(w, h) * 0.28;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(crouching ? 0 : jumping ? rot * 0.08 : rot * 0.03);

  // Front face
  ctx.fillStyle = '#1a1a1a'; ctx.strokeStyle = accent; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.fill(); ctx.stroke();

  // Top face
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2);
  ctx.lineTo(-w / 2 + d, -h / 2 - d);
  ctx.lineTo(w / 2 + d, -h / 2 - d);
  ctx.lineTo(w / 2, -h / 2);
  ctx.closePath();
  ctx.fillStyle = crouching ? '#333' : '#2a2a2a';
  ctx.fill(); ctx.strokeStyle = accent + '88'; ctx.stroke();

  // Right face
  ctx.beginPath();
  ctx.moveTo(w / 2, -h / 2);
  ctx.lineTo(w / 2 + d, -h / 2 - d);
  ctx.lineTo(w / 2 + d, h / 2 - d);
  ctx.lineTo(w / 2, h / 2);
  ctx.closePath();
  ctx.fillStyle = '#131313'; ctx.fill(); ctx.strokeStyle = accent + '66'; ctx.stroke();

  // Inner detail
  if (!crouching) {
    ctx.beginPath();
    ctx.rect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);
    ctx.strokeStyle = accent + '33'; ctx.lineWidth = 1; ctx.stroke();
  }

  ctx.restore();
}

export default function GamePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const uiStateRef = useRef<'idle' | 'playing' | 'over'>('idle');

  const gameRef = useRef({
    running: false, over: false, started: false,
    cubeY: GROUND_Y - CUBE_SIZE, cubeVY: 0,
    jumping: false, doubleAvail: true,
    crouching: false, crouchTimer: 0,
    shielded: false, shieldTimer: 0,
    slowTimer: 0,
    obstacles: [] as Obstacle[],
    powerUps: [] as PowerUp[],
    particles: [] as Particle[],
    score: 0, dist: 0, level: 1, nextLevelDist: 500,
    spawnCooldown: 60, cubeRot: 0, bgOffset: 0,
    stars: [] as { x: number; y: number; r: number; op: number }[],
    scrollLines: [] as { x: number; speed: number; op: number }[],
    combo: 0, lastObstaclePassed: -1,
  });

  const [uiState, setUiState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const prevLevelRef = useRef(1);

  // Double-tap detection
  const lastTapRef = useRef(0);
  // Swipe detection
  const touchStartYRef = useRef(0);
  const touchStartXRef = useRef(0);

  const setUiStateBoth = (s: 'idle' | 'playing' | 'over') => {
    uiStateRef.current = s;
    setUiState(s);
  };

  useEffect(() => {
    const hs = parseInt(localStorage.getItem('bbgame-hs') || '0');
    setHighScore(hs);
    const g = gameRef.current;
    g.stars = Array.from({ length: 50 }, () => ({
      x: Math.random() * W,
      y: Math.random() * (GROUND_Y - 60),
      r: Math.random() * 1.5 + 0.5,
      op: Math.random() * 0.5 + 0.15,
    }));
    g.scrollLines = Array.from({ length: 8 }, () => ({
      x: Math.random() * W,
      speed: Math.random() * 2 + 1,
      op: Math.random() * 0.08 + 0.02,
    }));
  }, []);

  const spawnParticles = (x: number, y: number, color: string, count = 8) => {
    const g = gameRef.current;
    for (let i = 0; i < count; i++) {
      g.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 5,
        vy: Math.random() * 3 + 1,
        life: 1, maxLife: 1,
        color,
        r: Math.random() * 3 + 1,
      });
    }
  };

  const jump = useCallback(() => {
    const g = gameRef.current;
    const currentState = uiStateRef.current;

    if (!g.started || currentState === 'idle') {
      g.started = true;
      g.running = true;
      g.cubeVY = JUMP_FORCE;
      g.jumping = true;
      g.doubleAvail = true;
      g.crouching = false;
      setUiStateBoth('playing');
      spawnParticles(36 + CUBE_SIZE / 2, g.cubeY + CUBE_SIZE, '#fac9f6');
      return;
    }
    if (g.over || g.crouching) return;

    if (!g.jumping) {
      g.cubeVY = JUMP_FORCE;
      g.jumping = true;
      g.doubleAvail = true;
      const cfg = LEVEL_CONFIG[Math.min(g.level - 1, 49)];
      spawnParticles(36 + CUBE_SIZE / 2, g.cubeY + CUBE_SIZE, cfg.accentColor);
    } else if (g.doubleAvail) {
      g.cubeVY = DOUBLE_JUMP_FORCE;
      g.doubleAvail = false;
      const cfg = LEVEL_CONFIG[Math.min(g.level - 1, 49)];
      spawnParticles(36 + CUBE_SIZE / 2, g.cubeY + CUBE_SIZE / 2, cfg.accentColor, 12);
    }
  }, []);

  const crouch = useCallback(() => {
    const g = gameRef.current;
    if (!g.running || g.over || g.jumping) return;
    g.crouching = true;
    g.crouchTimer = 28; // frames to stay crouched
  }, []);

  const resetGame = useCallback(() => {
    const g = gameRef.current;
    Object.assign(g, {
      running: false, over: false, started: false,
      cubeY: GROUND_Y - CUBE_SIZE, cubeVY: 0,
      jumping: false, doubleAvail: true,
      crouching: false, crouchTimer: 0,
      shielded: false, shieldTimer: 0, slowTimer: 0,
      obstacles: [], powerUps: [], particles: [],
      score: 0, dist: 0, level: 1, nextLevelDist: 500,
      spawnCooldown: 60, cubeRot: 0, bgOffset: 0,
      combo: 0, lastObstaclePassed: -1,
    });
    prevLevelRef.current = 1;
    setScore(0); setLevel(1); setIsNewHighScore(false);
    setUiStateBoth('idle');
  }, []);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); }
      if (e.code === 'ArrowDown') { e.preventDefault(); crouch(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump, crouch]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const loop = () => {
      const g = gameRef.current;
      const cfg = LEVEL_CONFIG[Math.min(g.level - 1, 49)];
      const spd = g.slowTimer > 0 ? cfg.speed * 0.5 : cfg.speed;
      const acc = cfg.accentColor;

      // Background
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      // Stars
      g.stars.forEach(s => {
        s.x -= 0.25;
        if (s.x < 0) { s.x = W; s.y = Math.random() * (GROUND_Y - 60); }
        ctx.fillStyle = `rgba(255,255,255,${s.op})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      });

      // Speed lines
      g.scrollLines.forEach(l => {
        if (!g.running) return;
        l.x -= l.speed * (spd / BASE_SPEED);
        if (l.x < 0) l.x = W + 20;
        ctx.strokeStyle = `rgba(255,255,255,${l.op})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(l.x, 0); ctx.lineTo(l.x - 60, GROUND_Y); ctx.stroke();
      });

      // Ground
      ctx.fillStyle = '#0d0d0d';
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

      // Grid on ground
      const gx = (g.bgOffset * 0.4) % 50;
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 0.5;
      for (let i = -50; i < W + 50; i += 50) {
        ctx.beginPath(); ctx.moveTo(i - gx, GROUND_Y); ctx.lineTo(i - gx, H); ctx.stroke();
      }

      // Ground line glow
      ctx.shadowColor = acc; ctx.shadowBlur = 8;
      ctx.strokeStyle = acc + '55'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(W, GROUND_Y); ctx.stroke();
      ctx.shadowBlur = 0;

      if (g.running && !g.over) {
        g.bgOffset += spd;

        // Timers
        if (g.crouchTimer > 0) { g.crouchTimer--; if (g.crouchTimer <= 0) g.crouching = false; }
        if (g.shieldTimer > 0) { g.shieldTimer--; if (g.shieldTimer <= 0) g.shielded = false; }
        if (g.slowTimer > 0) g.slowTimer--;

        // Physics
        g.cubeVY += GRAVITY;
        g.cubeY += g.cubeVY;
        if (g.cubeY >= GROUND_Y - CUBE_SIZE) {
          g.cubeY = GROUND_Y - CUBE_SIZE;
          g.cubeVY = 0; g.jumping = false; g.doubleAvail = true;
        }
        g.cubeRot += 2;

        // Spawn obstacles
        g.spawnCooldown--;
        if (g.spawnCooldown <= 0 && g.obstacles.length < 5) {
          const obs = getObstacle(g.level, W + 40);
          g.obstacles.push(obs);
          // Double obstacle: add a second one close behind
          if (obs.type === 'double') {
            g.obstacles.push({ ...getObstacle(g.level, W + 40 + obs.w + 32), type: 'low', color: acc });
          }
          g.spawnCooldown = cfg.gap / spd;

          // Occasionally spawn a power-up
          if (g.level >= 5 && Math.random() < 0.18) {
            g.powerUps.push({
              x: W + 80 + Math.random() * 60,
              y: GROUND_Y - 80 - Math.random() * 60,
              type: Math.random() < 0.5 ? 'shield' : 'slow',
              collected: false,
            });
          }
        }

        // Move obstacles
        g.obstacles = g.obstacles.filter(o => o.x + o.w > -10);
        g.obstacles.forEach(o => { o.x -= spd; });

        // Move power-ups
        g.powerUps = g.powerUps.filter(p => p.x > -20 && !p.collected);
        g.powerUps.forEach(p => { p.x -= spd; });

        // Distance & level
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

        // Cube dimensions (crouching = shorter)
        const cH = g.crouching ? CROUCH_HEIGHT : CUBE_SIZE;
        const cx = 36, cy = g.crouching ? GROUND_Y - CROUCH_HEIGHT : g.cubeY;
        const cw = CUBE_SIZE;

        // Collision with obstacles
        for (const o of g.obstacles) {
          const hit =
            cx + cw - 4 > o.x + 3 &&
            cx + 4 < o.x + o.w - 3 &&
            cy + cH - 4 > o.y + 3 &&
            cy + 4 < o.y + o.h - 3;
          if (hit) {
            if (g.shielded) {
              // Shield absorbs one hit
              g.shielded = false; g.shieldTimer = 0;
              o.x = -200; // push obstacle off screen
              spawnParticles(cx + cw / 2, cy + cH / 2, '#60a5fa', 16);
            } else {
              g.over = true; g.running = false;
              spawnParticles(cx + cw / 2, cy + cH / 2, acc, 24);
              const hs = parseInt(localStorage.getItem('bbgame-hs') || '0');
              const newHS = g.score > hs;
              if (newHS) { localStorage.setItem('bbgame-hs', String(g.score)); setHighScore(g.score); setIsNewHighScore(true); }
              setUiStateBoth('over');
              break;
            }
          }
        }

        // Collect power-ups
        g.powerUps.forEach(p => {
          if (!p.collected &&
            cx + cw > p.x - 12 && cx < p.x + 12 &&
            cy + cH > p.y - 12 && cy < p.y + 12) {
            p.collected = true;
            if (p.type === 'shield') { g.shielded = true; g.shieldTimer = 200; }
            if (p.type === 'slow') { g.slowTimer = 180; }
            spawnParticles(p.x, p.y, p.type === 'shield' ? '#60a5fa' : '#fbbf24', 12);
          }
        });
      }

      // Draw power-ups
      g.powerUps.filter(p => !p.collected).forEach(p => {
        const color = p.type === 'shield' ? '#60a5fa' : '#fbbf24';
        ctx.shadowColor = color; ctx.shadowBlur = 10;
        ctx.fillStyle = color + '22';
        ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = color;
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(p.type === 'shield' ? '🛡' : '⚡', p.x, p.y);
        ctx.shadowBlur = 0;
        ctx.textBaseline = 'alphabetic';
      });

      // Draw obstacles
      g.obstacles.forEach(o => {
        ctx.shadowColor = o.color; ctx.shadowBlur = 8;
        ctx.fillStyle = '#111'; ctx.strokeStyle = o.color; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(o.x, o.y, o.w, o.h, 4);
        ctx.fill(); ctx.stroke();
        // Inner glow
        ctx.strokeStyle = o.color + '44'; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.roundRect(o.x + 3, o.y + 3, o.w - 6, o.h - 6, 2); ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Draw player
      const cH = g.crouching ? CROUCH_HEIGHT : CUBE_SIZE;
      const cy = g.crouching ? GROUND_Y - CROUCH_HEIGHT : g.cubeY;

      // Shield aura
      if (g.shielded) {
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 150);
        ctx.strokeStyle = `rgba(96,165,250,${0.4 + pulse * 0.3})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#60a5fa'; ctx.shadowBlur = 15;
        ctx.beginPath(); ctx.arc(36 + CUBE_SIZE / 2, cy + cH / 2, CUBE_SIZE * 0.9, 0, Math.PI * 2); ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.shadowColor = acc; ctx.shadowBlur = 12;
      drawCube(ctx, 36, cy, CUBE_SIZE, cH, g.cubeRot, acc, g.jumping, g.crouching);
      ctx.shadowBlur = 0;

      // Particles
      g.particles = g.particles.filter(p => p.life > 0);
      g.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= 0.045;
        ctx.globalAlpha = p.life;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
      });
      ctx.globalAlpha = 1;

      // HUD
      if (g.started) {
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = acc; ctx.textAlign = 'right';
        ctx.fillText(`LVL ${g.level}`, W - 16, 28);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '11px monospace';
        ctx.fillText(`${g.score}`, W - 16, 46);

        if (g.slowTimer > 0) {
          ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'left';
          ctx.fillText('SLOW ⚡', 14, 28);
        }
        if (g.shielded) {
          ctx.fillStyle = '#60a5fa'; ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'left';
          ctx.fillText('SHIELD 🛡', 14, g.slowTimer > 0 ? 44 : 28);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Touch handlers — distinguish tap vs double-tap vs swipe-down
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    touchStartXRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const dy = touch.clientY - touchStartYRef.current;
    const dx = Math.abs(touch.clientX - touchStartXRef.current);

    // Swipe down to crouch
    if (dy > 35 && dx < 40) {
      crouch();
      return;
    }

    // Swipe up = jump (alternative)
    if (dy < -35 && dx < 40) {
      jump();
      return;
    }

    // Tap — check for double tap
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    if (timeSinceLastTap < 280 && timeSinceLastTap > 30) {
      // Double tap = force double jump
      const g = gameRef.current;
      if (g.jumping && g.doubleAvail) {
        g.cubeVY = DOUBLE_JUMP_FORCE;
        g.doubleAvail = false;
        const cfg = LEVEL_CONFIG[Math.min(g.level - 1, 49)];
        spawnParticles(36 + CUBE_SIZE / 2, g.cubeY + CUBE_SIZE / 2, cfg.accentColor, 12);
      }
    } else {
      jump();
    }
    lastTapRef.current = now;
  }, [jump, crouch]);

  // Pointer handler for mouse (desktop)
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') {
      if ((e.target as HTMLElement).tagName === 'BUTTON') return;
      jump();
    }
  }, [jump]);

  const accentNow = LEVEL_CONFIG[Math.min(level - 1, 49)].accentColor;

  return (
    <main className="min-h-screen bg-black flex flex-col items-center touch-none overflow-hidden select-none">
      <header className="w-full max-w-md p-4 flex items-center justify-between border-b border-white/10 z-50 bg-black sticky top-0">
        <button onClick={() => router.back()} className="p-2 bg-zinc-900 rounded-xl active:scale-90 transition-transform">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-black uppercase italic">BlackBox Runner</h1>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Tap · Swipe ↓ crouch</p>
        </div>
        <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-xl">
          <Trophy size={12} className="text-yellow-500" />
          <span className="text-xs font-black">{highScore}</span>
        </div>
      </header>

      <div
        className="relative mt-6"
        style={{
          width: W, height: H,
          touchAction: 'none',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handlePointerDown}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ display: 'block', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.08)' }}
        />

        {/* IDLE overlay */}
        <AnimatePresence>
          {uiState === 'idle' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              style={{ borderRadius: '1.5rem', background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(4px)' }}
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
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-8">50 levels · tap to start</p>
              <div className="flex flex-col items-center gap-2 mb-6">
                {[
                  { icon: '👆', text: 'Tap = Jump' },
                  { icon: '✌️', text: 'Double tap = Double jump' },
                  { icon: '👇', text: 'Swipe down = Crouch' },
                  { icon: '🛡', text: 'Collect shields & slow-mo' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2">
                    <span className="text-sm">{icon}</span>
                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{text}</span>
                  </div>
                ))}
              </div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="text-[13px] font-black uppercase tracking-[0.3em] text-white/60"
              >
                TAP TO START
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GAME OVER overlay */}
        <AnimatePresence>
          {uiState === 'over' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4"
              style={{ borderRadius: '1.5rem', background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)' }}
            >
              <motion.div
                animate={{ rotate: [0, -6, 6, -3, 0] }}
                transition={{ duration: 0.5 }}
                className="text-5xl mb-1"
              >💥</motion.div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Game Over</h2>
              <div className="grid grid-cols-3 gap-3 w-64">
                {[
                  { label: 'Score', val: score, icon: '⚡' },
                  { label: 'Level', val: level, icon: '🎯' },
                  { label: 'Best', val: highScore, icon: '🏆' },
                ].map(({ label, val, icon }) => (
                  <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-2xl border border-white/10 bg-white/5">
                    <span className="text-xl">{icon}</span>
                    <span className="text-lg font-black text-white">{val}</span>
                    <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">{label}</span>
                  </div>
                ))}
              </div>
              {isNewHighScore && (
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.3 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/40 bg-yellow-500/10"
                >
                  <Trophy size={12} className="text-yellow-400" />
                  <span className="text-[10px] font-black uppercase text-yellow-400 tracking-widest">New High Score!</span>
                </motion.div>
              )}
              <button
                onPointerDown={(e) => { e.stopPropagation(); resetGame(); }}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-sm active:scale-95 transition-all mt-1"
              >
                <RotateCcw size={16} /> Play Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level-up toast */}
        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-black/80 backdrop-blur-sm pointer-events-none z-50"
            >
              <span className="text-sm">⚡</span>
              <span className="text-[11px] font-black uppercase tracking-widest text-white">Level {level}!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live HUD bar */}
        {uiState === 'playing' && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-4 py-2 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-sm pointer-events-none">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentNow }} />
              <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">Lvl {level}</span>
            </div>
            <span className="text-[11px] font-black text-white/70 font-mono">{score}</span>
            <div className="flex items-center gap-1.5">
              <Trophy size={10} className="text-yellow-500/60" />
              <span className="text-[10px] font-black text-white/35 font-mono">{highScore}</span>
            </div>
          </div>
        )}
      </div>

      {/* Level progress bar */}
      {uiState === 'playing' && (
        <div className="mt-4 w-full max-w-md px-4">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: accentNow }}
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

      <div className="mt-4 flex items-center gap-3 text-[9px] font-black uppercase text-white/15 tracking-widest flex-wrap justify-center px-4">
        <span> Tap = Jump</span>
        <span>·</span>
        <span> Double tap = Double jump</span>
        <span>·</span>
        <span> Swipe ↓ = Crouch</span>
      </div>
    </main>
  );
}

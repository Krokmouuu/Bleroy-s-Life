import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";

const LOGO_PIXELS: [number, number][] = [
  [1, 0],
  [11, 0],
  [0, 1],
  [1, 1],
  [11, 1],
  [12, 1],
  [0, 2],
  [12, 2],
  [0, 3],
  [12, 3],
  [0, 4],
  [12, 4],
  [1, 4],
  [11, 4],
  [1, 5],
  [11, 5],
  [2, 5],
  [10, 5],
  [2, 6],
  [3, 6],
  [4, 6],
  [5, 6],
  [6, 6],
  [7, 6],
  [8, 6],
  [9, 6],
  [10, 6],
  [2, 7],
  [3, 7],
  [4, 7],
  [5, 7],
  [6, 7],
  [7, 7],
  [8, 7],
  [9, 7],
  [10, 7],
  [2, 8],
  [3, 8],
  [4, 8],
  [5, 8],
  [6, 8],
  [7, 8],
  [8, 8],
  [9, 8],
  [10, 8],
  [2, 9],
  [3, 9],
  [4, 9],
  [5, 9],
  [6, 9],
  [7, 9],
  [8, 9],
  [9, 9],
  [10, 9],
  [2, 10],
  [5, 10],
  [6, 10],
  [7, 10],
  [10, 10],
  [2, 11],
  [5, 11],
  [6, 11],
  [7, 11],
  [10, 11],
  [2, 12],
  [3, 12],
  [4, 12],
  [5, 12],
  [6, 12],
  [7, 12],
  [8, 12],
  [9, 12],
  [10, 12],
  [2, 13],
  [3, 13],
  [4, 13],
  [5, 13],
  [6, 13],
  [7, 13],
  [8, 13],
  [9, 13],
  [10, 13],
];

// Glider pattern (3×3) - moves diagonally down-right
const GLIDER_CELLS: [number, number][] = [
  [1, 0],
  [2, 1],
  [0, 2],
  [1, 2],
  [2, 2],
];

// Glider orienté pour monter vers la gauche (en bas à droite → centre) — rotation 180° du glider standard
const GLIDER_UPLEFT_CELLS: [number, number][] = [
  [1, 0],
  [0, 1],
  [1, 1],
  [0, 2],
  [2, 2],
];

// Pulsar (13×13) - période 3, coin haut droite
const PULSAR_CELLS: [number, number][] = [
  [2, 0], [3, 0], [4, 0], [8, 0], [9, 0], [10, 0],
  [0, 2], [5, 2], [7, 2], [12, 2],
  [0, 3], [5, 3], [7, 3], [12, 3],
  [0, 4], [5, 4], [7, 4], [12, 4],
  [2, 5], [3, 5], [4, 5], [8, 5], [9, 5], [10, 5],
  [2, 7], [3, 7], [4, 7], [8, 7], [9, 7], [10, 7],
  [0, 8], [5, 8], [7, 8], [12, 8],
  [0, 9], [5, 9], [7, 9], [12, 9],
  [0, 10], [5, 10], [7, 10], [12, 10],
  [2, 12], [3, 12], [4, 12], [8, 12], [9, 12], [10, 12],
];
const PULSAR_W = 13;
const PULSAR_OY = 2;
const PULSAR_OX = 50 - PULSAR_W; // 37, coin haut droite

// Eater 1 (4×4) - coin bas gauche
const EATER1_CELLS: [number, number][] = [
  [0, 0], [1, 0], [0, 1], [1, 1],
  [2, 2], [2, 3], [3, 3],
];
const EATER1_OX = 3;
const EATER1_OY = 35 - 4; // 31

// Second glider : bas droite → centre
const GLIDER2_START_X = 46;
const GLIDER2_START_Y = 31;

const INTRO_GRID_W = 50;
const INTRO_GRID_H = 35;
const LOGO_OX = 19; // center 25 - 6
const LOGO_OY = 10; // center 17 - 7
const GLIDER_START_X = 2;
const GLIDER_START_Y = 2;
const LOGO_W = 13;
const LOGO_H = 14;
const DISINTEGRATE_GENS = 48; // minimum pour l'explosion ; passage à "exit" 
const GEN_MS = 140;
const GLIDER_TICK_MS = 90

const CELL_COLOR = "rgb(255, 255, 255)";

// Bords toriques (pour la phase disintegrate)
function countNeighbors(grid: boolean[][], x: number, y: number): number {
  let c = 0;
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const nx = (x + dx + INTRO_GRID_W) % INTRO_GRID_W;
      const ny = (y + dy + INTRO_GRID_H) % INTRO_GRID_H;
      if (grid[nx][ny]) c++;
    }
  return c;
}

// Bords morts (hors grille = mort) pour la phase glider : comportement réel du jeu de la vie
function countNeighborsDeadBounds(
  grid: boolean[][],
  x: number,
  y: number,
  w: number,
  h: number,
): number {
  let c = 0;
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < w && ny >= 0 && ny < h && grid[nx][ny]) c++;
    }
  return c;
}

function nextGen(grid: boolean[][]): boolean[][] {
  return grid.map((col, x) =>
    col.map((_, y) => {
      const n = countNeighbors(grid, x, y);
      if (grid[x][y]) return n === 2 || n === 3;
      return n === 3;
    }),
  );
}

function nextGenDeadBounds(
  grid: boolean[][],
  w: number,
  h: number,
): boolean[][] {
  return grid.map((col, x) =>
    col.map((_, y) => {
      const n = countNeighborsDeadBounds(grid, x, y, w, h);
      if (grid[x][y]) return n === 2 || n === 3;
      return n === 3;
    }),
  );
}

interface IntroOverlayProps {
  onComplete: () => void;
}

export function IntroOverlay({ onComplete }: IntroOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const [phase, setPhase] = useState<
    "logo" | "glider" | "disintegrate" | "exit"
  >("logo");
  const [gliderGrid, setGliderGrid] = useState<boolean[][] | null>(null);
  const [golGrid, setGolGrid] = useState<boolean[][] | null>(null);
  const [gen, setGen] = useState(0);
  const [overlayOpacity, setOverlayOpacity] = useState(1);
  const animRef = useRef<number>(0);

  const cellSize = useRef(0);
  const [canvasReady, setCanvasReady] = useState(false);
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const size = Math.max(w / INTRO_GRID_W, h / INTRO_GRID_H);
    cellSize.current = size;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
    setCanvasReady(true);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cs = cellSize.current;
    const offsetX = (w - INTRO_GRID_W * cs) / 2;
    const offsetY = (h - INTRO_GRID_H * cs) / 2;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= INTRO_GRID_W; i++) {
      ctx.beginPath();
      ctx.moveTo(offsetX + i * cs, offsetY);
      ctx.lineTo(offsetX + i * cs, offsetY + INTRO_GRID_H * cs);
      ctx.stroke();
    }
    for (let j = 0; j <= INTRO_GRID_H; j++) {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + j * cs);
      ctx.lineTo(offsetX + INTRO_GRID_W * cs, offsetY + j * cs);
      ctx.stroke();
    }

    const drawCell = (gx: number, gy: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(
        offsetX + gx * cs + 1,
        offsetY + gy * cs + 1,
        cs - 1,
        cs - 1,
      );
    };

    if (phase === "logo") {
      LOGO_PIXELS.forEach(([px, py]) =>
        drawCell(LOGO_OX + px, LOGO_OY + py, CELL_COLOR),
      );
    } else if (phase === "glider") {
      LOGO_PIXELS.forEach(([px, py]) =>
        drawCell(LOGO_OX + px, LOGO_OY + py, CELL_COLOR),
      );
      if (gliderGrid) {
        for (let x = 0; x < INTRO_GRID_W; x++)
          for (let y = 0; y < INTRO_GRID_H; y++)
            if (gliderGrid[x][y]) drawCell(x, y, CELL_COLOR);
      }
    } else if ((phase === "disintegrate" || phase === "exit") && golGrid) {
      for (let x = 0; x < INTRO_GRID_W; x++)
        for (let y = 0; y < INTRO_GRID_H; y++)
          if (golGrid[x][y]) drawCell(x, y, CELL_COLOR);
    }
  }, [phase, gliderGrid, golGrid, canvasReady]);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Phase: logo -> wait 1.2s -> glider (init glider grid with glider at start)
  useEffect(() => {
    if (phase !== "logo") return;
    const t = setTimeout(() => setPhase("glider"), 200);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "glider") return;
    const grid = Array(INTRO_GRID_W)
      .fill(null)
      .map(() => Array(INTRO_GRID_H).fill(false));
    GLIDER_CELLS.forEach(([dx, dy]) => {
      const gx = GLIDER_START_X + dx;
      const gy = GLIDER_START_Y + dy;
      if (gx >= 0 && gx < INTRO_GRID_W && gy >= 0 && gy < INTRO_GRID_H)
        grid[gx][gy] = true;
    });
    PULSAR_CELLS.forEach(([dx, dy]) => {
      const gx = PULSAR_OX + dx;
      const gy = PULSAR_OY + dy;
      if (gx >= 0 && gx < INTRO_GRID_W && gy >= 0 && gy < INTRO_GRID_H)
        grid[gx][gy] = true;
    });
    EATER1_CELLS.forEach(([dx, dy]) => {
      const gx = EATER1_OX + dx;
      const gy = EATER1_OY + dy;
      if (gx >= 0 && gx < INTRO_GRID_W && gy >= 0 && gy < INTRO_GRID_H)
        grid[gx][gy] = true;
    });
    GLIDER_UPLEFT_CELLS.forEach(([dx, dy]) => {
      const gx = GLIDER2_START_X + dx;
      const gy = GLIDER2_START_Y + dy;
      if (gx >= 0 && gx < INTRO_GRID_W && gy >= 0 && gy < INTRO_GRID_H)
        grid[gx][gy] = true;
    });
    setGliderGrid(grid);
  }, [phase]);

  useEffect(() => {
    if (phase !== "glider") return;
    const id = setInterval(() => {
      setGliderGrid((g) => {
        if (!g) return g;
        const next = nextGenDeadBounds(g, INTRO_GRID_W, INTRO_GRID_H);
        // Collision : une cellule du glider est dans le rectangle du logo
        let hit = false;
        for (let x = LOGO_OX; x < LOGO_OX + LOGO_W && !hit; x++)
          for (let y = LOGO_OY; y < LOGO_OY + LOGO_H && !hit; y++)
            if (next[x]?.[y]) hit = true;
        if (hit) {
          const merged = Array(INTRO_GRID_W)
            .fill(null)
            .map(() => Array(INTRO_GRID_H).fill(false));
          LOGO_PIXELS.forEach(([px, py]) => {
            const gx = LOGO_OX + px;
            const gy = LOGO_OY + py;
            if (gx >= 0 && gx < INTRO_GRID_W && gy >= 0 && gy < INTRO_GRID_H)
              merged[gx][gy] = true;
          });
          for (let x = 0; x < INTRO_GRID_W; x++)
            for (let y = 0; y < INTRO_GRID_H; y++)
              if (next[x][y]) merged[x][y] = true;
          setGolGrid(merged);
          setGen(0);
          setPhase("disintegrate");
          return g;
        }
        return next;
      });
    }, GLIDER_TICK_MS);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "disintegrate") return;
    const id = setInterval(() => {
      setGolGrid((g) => (g ? nextGen(g) : g));
      setGen((n) => n + 1);
    }, GEN_MS);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "disintegrate") return;
    if (gen >= DISINTEGRATE_GENS) setPhase("exit");
  }, [phase, gen]);

  // Phase: exit -> fade content to black then onComplete
  useEffect(() => {
    if (phase !== "exit") return;
    const start = performance.now();
    const duration = 900;
    const tick = () => {
      const elapsed = performance.now() - start;
      const t = Math.min(elapsed / duration, 1);
      setOverlayOpacity(1 - t); // fade content (wrapper opacity) to 0 → écran noir
      if (t < 1) requestAnimationFrame(tick);
      else onCompleteRef.current();
    };
    requestAnimationFrame(tick);
  }, [phase]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto"
      style={{ backgroundColor: "#000" }}
    >
      <div className="absolute inset-0" style={{ opacity: overlayOpacity }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
        />
      </div>
    </motion.div>
  );
}

import React, { useState, useEffect, useCallback, useMemo } from "react";

// Logo initial shape: pixels (x, y) in grid 13×14
const INITIAL_PIXELS: [number, number][] = [
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

const GRID_W = 13;
const GRID_H = 14;
const TICK_MS = 180;
const GENERATIONS_BEFORE_LOOP = 55;
const LOGO_PAUSE_MS = 5000;

function makeInitialGrid(): boolean[][] {
  const grid = Array(GRID_W)
    .fill(null)
    .map(() => Array(GRID_H).fill(false));
  for (const [x, y] of INITIAL_PIXELS) {
    if (x >= 0 && x < GRID_W && y >= 0 && y < GRID_H) grid[x][y] = true;
  }
  return grid;
}

function countNeighbors(grid: boolean[][], x: number, y: number): number {
  let count = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const nx = (x + dx + GRID_W) % GRID_W;
      const ny = (y + dy + GRID_H) % GRID_H;
      if (grid[nx][ny]) count++;
    }
  }
  return count;
}

function nextGeneration(grid: boolean[][]): boolean[][] {
  return grid.map((col, x) =>
    col.map((_, y) => {
      const n = countNeighbors(grid, x, y);
      if (grid[x][y]) return n === 2 || n === 3;
      return n === 3;
    }),
  );
}

export function ConwayLogo({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const initialGrid = useMemo(() => makeInitialGrid(), []);
  const [grid, setGrid] = useState<boolean[][]>(() =>
    initialGrid.map((col) => col.slice()),
  );
  const [gen, setGen] = useState(0);
  const [phase, setPhase] = useState<"logo" | "simulating" | "reversing">(
    "logo",
  );
  const [history, setHistory] = useState<boolean[][][]>([]);
  const [reverseIndex, setReverseIndex] = useState(0);

  const tick = useCallback(() => {
    setGrid((g) => {
      const next = nextGeneration(g);
      setHistory((h) => [...h, next.map((col) => col.slice())]);
      return next;
    });
    setGen((n) => n + 1);
  }, []);

  // Phase "logo": show logo 5s then start simulating
  useEffect(() => {
    if (phase !== "logo") return;
    setGrid(initialGrid.map((col) => col.slice()));
    setGen(0);
    setHistory([]);
    const t = setTimeout(() => setPhase("simulating"), LOGO_PAUSE_MS);
    return () => clearTimeout(t);
  }, [phase, initialGrid]);

  // Seed history with initial grid when starting simulation
  useEffect(() => {
    if (phase === "simulating" && history.length === 0) {
      setHistory([initialGrid.map((col) => col.slice())]);
    }
  }, [phase, history.length, initialGrid]);

  // Phase "simulating": tick until N generations, then go to reversing
  useEffect(() => {
    if (phase !== "simulating") return;
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [phase, tick]);

  // When simulation reaches N generations, switch to reversing
  useEffect(() => {
    if (phase !== "simulating" || gen < GENERATIONS_BEFORE_LOOP) return;
    setPhase("reversing");
  }, [phase, gen]);

  // Phase "reversing": play history backwards (from last to logo)
  useEffect(() => {
    if (phase !== "reversing" || history.length === 0) return;
    const lastIdx = history.length - 1;
    setReverseIndex(lastIdx);
    setGrid(history[lastIdx].map((col) => col.slice()));
    const id = setInterval(() => {
      setReverseIndex((i) => {
        if (i <= 0) {
          setPhase("logo");
          setHistory([]);
          return 0;
        }
        const prev = i - 1;
        setGrid(history[prev].map((col) => col.slice()));
        return prev;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [phase, history]);

  const cells = useMemo(() => {
    const out: [number, number][] = [];
    for (let x = 0; x < GRID_W; x++) {
      for (let y = 0; y < GRID_H; y++) {
        if (grid[x][y]) out.push([x, y]);
      }
    }
    return out;
  }, [grid]);

  return (
    <div className={className} style={style}>
      <svg
        viewBox={`0 0 ${GRID_W} ${GRID_H}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {cells.map(([x, y]) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={1}
            height={1}
            rx={0.12}
            fill="currentColor"
          />
        ))}
      </svg>
    </div>
  );
}

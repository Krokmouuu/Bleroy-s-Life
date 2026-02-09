import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  GRID_SIZE,
  MIN_CELL_SIZE,
  MAX_CELL_SIZE,
  type Pattern,
  type Folder,
  type SelectionRect,
} from './types';
import { BackgroundOverlay } from './components/BackgroundOverlay';
import { SidebarToggle } from './components/SidebarToggle';
import { Sidebar } from './components/Sidebar';
import { Controls } from './components/Controls';
import { GameGrid } from './components/GameGrid';
import { SaveDialog } from './components/SaveDialog';
import { NewFolderDialog } from './components/NewFolderDialog';
import { IntroOverlay } from './components/IntroOverlay';

function mod(a: number, n: number): number {
  return ((a % n) + n) % n;
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [grid, setGrid] = useState<boolean[][]>(() =>
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [generation, setGeneration] = useState(0);
  const [savedPatterns, setSavedPatterns] = useState<Pattern[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newPatternName, setNewPatternName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderIcon, setNewFolderIcon] = useState('folder');
  const [cellSize, setCellSize] = useState(8);
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'draw' | 'erase'>('draw');
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const [isSelectingRect, setIsSelectingRect] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [patternToPlace, setPatternToPlace] = useState<Pattern | null>(null);
  const [placementRotation, setPlacementRotation] = useState(0); // 0, 1, 2, 3 = 0°, 90°, 180°, 270° CW

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panBoundsRef = useRef({ minX: 0, maxX: 0, minY: 0, maxY: 0 });
  const runningRef = useRef(isRunning);
  const speedRef = useRef(speed);
  const initialViewCenteredRef = useRef(false);

  useEffect(() => {
    runningRef.current = isRunning;
    speedRef.current = speed;
  }, [isRunning, speed]);

  useEffect(() => {
    const onPointerLockChange = () => {
      if (!document.pointerLockElement) setIsPanning(false);
    };
    document.addEventListener('pointerlockchange', onPointerLockChange);
    return () => document.removeEventListener('pointerlockchange', onPointerLockChange);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w <= 0 || h <= 0) return;
    const gridPx = GRID_SIZE * cellSize;
    setViewOffset((prev) => ({
      x: Math.max(-gridPx, Math.min(w, prev.x)),
      y: Math.max(-gridPx, Math.min(h, prev.y)),
    }));
  }, [cellSize]);

  useEffect(() => {
    if (showIntro || initialViewCenteredRef.current) return;
    const container = containerRef.current;
    if (!container) return;
    const tryCenter = () => {
      if (initialViewCenteredRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;
      initialViewCenteredRef.current = true;
      const gridPx = GRID_SIZE * cellSize;
      setViewOffset({
        x: w / 2 - gridPx / 2,
        y: h / 2 - gridPx / 2,
      });
    };
    tryCenter();
    const ro = new ResizeObserver(tryCenter);
    ro.observe(container);
    return () => ro.disconnect();
  }, [showIntro, cellSize]);

  // Charger grille, presets et dossiers au montage
  useEffect(() => {
    const saved = localStorage.getItem('conway-patterns');
    const savedFolders = localStorage.getItem('conway-folders');
    const savedState = localStorage.getItem('conway-state');
    if (saved) setSavedPatterns(JSON.parse(saved));
    if (savedFolders) setFolders(JSON.parse(savedFolders));
    if (savedState) {
      try {
        const { cells, generation: savedGen } = JSON.parse(savedState) as {
          cells: [number, number][];
          generation?: number;
        };
        if (Array.isArray(cells) && cells.length > 0) {
          setGrid(() => {
            const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
            cells.forEach(([x, y]) => {
              if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
                newGrid[x][y] = true;
              }
            });
            return newGrid;
          });
          if (typeof savedGen === 'number' && savedGen >= 0) setGeneration(savedGen);
        }
      } catch {
      }
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const cells: [number, number][] = [];
      grid.forEach((row, x) => {
        row.forEach((cell, y) => {
          if (cell) cells.push([x, y]);
        });
      });
      try {
        localStorage.setItem('conway-state', JSON.stringify({ cells, generation }));
      } catch {
        // quota dépassé ou indisponible
      }
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [grid, generation]);

  const gridRef = useRef(grid);
  const generationRef = useRef(generation);
  gridRef.current = grid;
  generationRef.current = generation;

  useEffect(() => {
    const onBeforeUnload = () => {
      const g = gridRef.current;
      const cells: [number, number][] = [];
      g.forEach((row, x) => {
        row.forEach((cell, y) => {
          if (cell) cells.push([x, y]);
        });
      });
      try {
        localStorage.setItem('conway-state', JSON.stringify({ cells, generation: generationRef.current }));
      } catch {
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  const countNeighbors = useCallback((g: boolean[][], x: number, y: number) => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const nx = mod(x + i, GRID_SIZE);
        const ny = mod(y + j, GRID_SIZE);
        if (g[nx][ny]) count++;
      }
    }
    return count;
  }, []);

  // Règles B3/S23 : naissance si 3 voisins, survie si 2 ou 3.
  const runSimulation = useCallback(() => {
    if (!runningRef.current) return;
    setGrid((g) => {
      const newGrid = g.map((row, x) =>
        row.map((cell, y) => {
          const neighbors = countNeighbors(g, x, y);
          if (cell && (neighbors === 2 || neighbors === 3)) return true;
          if (!cell && neighbors === 3) return true;
          return false;
        })
      );
      return newGrid;
    });
    setGeneration((gen) => gen + 1);
    setTimeout(runSimulation, speedRef.current);
  }, [countNeighbors]);

  useEffect(() => {
    if (isRunning) runSimulation();
  }, [isRunning, runSimulation]);

  const toggleCell = useCallback(
    (x: number, y: number) => {
      if (!isEditMode || isSelectionMode) return;
      setGrid((g) => {
        const newGrid = g.map((row) => [...row]);
        newGrid[x][y] = !newGrid[x][y];
        return newGrid;
      });
    },
    [isEditMode, isSelectionMode]
  );

  const clearGrid = useCallback(() => {
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false)));
    setGeneration(0);
  }, []);

  const randomize = useCallback(() => {
    setGrid(
      Array(GRID_SIZE)
        .fill(null)
        .map(() =>
          Array(GRID_SIZE)
            .fill(null)
            .map(() => Math.random() > 0.85)
        )
    );
    setGeneration(0);
  }, []);

  const loadPattern = useCallback((pattern: Pattern) => {
    const offsetX = Math.floor(GRID_SIZE / 2) - 5;
    const offsetY = Math.floor(GRID_SIZE / 2) - 5;
    setGrid(() => {
      const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
      pattern.cells.forEach(([x, y]) => {
        const newX = mod(offsetX + x, GRID_SIZE);
        const newY = mod(offsetY + y, GRID_SIZE);
        newGrid[newX][newY] = true;
      });
      return newGrid;
    });
    setGeneration(0);
  }, []);

  const rotateCell = useCallback((dx: number, dy: number, rot: number): [number, number] => {
    const r = ((rot % 4) + 4) % 4;
    if (r === 0) return [dx, dy];
    if (r === 1) return [dy, -dx];
    if (r === 2) return [-dx, -dy];
    return [-dy, dx];
  }, []);

  const placePatternAt = useCallback(
    (anchorX: number, anchorY: number) => {
      if (!patternToPlace) return;
      const rot = ((placementRotation % 4) + 4) % 4;
      setGrid((g) => {
        const newGrid = g.map((row) => [...row]);
        const rotatedCells = patternToPlace.cells.map(([dx, dy]) => rotateCell(dx, dy, rot));
        rotatedCells.forEach(([rx, ry]) => {
          const x = mod(anchorX + rx, GRID_SIZE);
          const y = mod(anchorY + ry, GRID_SIZE);
          newGrid[x][y] = true;
        });
        return newGrid;
      });
      setPatternToPlace(null);
      setPlacementRotation(0);
    },
    [patternToPlace, placementRotation, rotateCell]
  );

  const rotatePlacement = useCallback((delta: number) => {
    setPlacementRotation((r) => ((r + delta) + 4) % 4);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPatternToPlace(null);
        setPlacementRotation(0);
        return;
      }
      if (!patternToPlace) return;
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        rotatePlacement(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        rotatePlacement(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        rotatePlacement(1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [patternToPlace, rotatePlacement]);

  useEffect(() => {
    if (patternToPlace) setPlacementRotation(0);
  }, [patternToPlace]);

  const saveCurrentPattern = useCallback(() => {
    if (!newPatternName.trim()) return;
    const cells: [number, number][] = [];
    let width: number | undefined;
    let height: number | undefined;
    if (selectionRect) {
      const minX = Math.min(selectionRect.startX, selectionRect.endX);
      const maxX = Math.max(selectionRect.startX, selectionRect.endX);
      const minY = Math.min(selectionRect.startY, selectionRect.endY);
      const maxY = Math.max(selectionRect.startY, selectionRect.endY);
      width = maxX - minX + 1;
      height = maxY - minY + 1;
      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          if (grid[x][y]) cells.push([x - minX, y - minY]);
        }
      }
    } else {
      grid.forEach((row, x) => {
        row.forEach((cell, y) => {
          if (cell) cells.push([x, y]);
        });
      });
    }
    if (cells.length === 0) return;
    const newPattern: Pattern = {
      id: Date.now().toString(),
      name: newPatternName,
      cells,
      ...(width != null && height != null ? { width, height } : {}),
      folderId: selectedFolder || undefined,
    };
    const updated = [...savedPatterns, newPattern];
    setSavedPatterns(updated);
    localStorage.setItem('conway-patterns', JSON.stringify(updated));
    setNewPatternName('');
    setShowSaveDialog(false);
    setSelectedFolder('');
    setSelectionRect(null);
  }, [newPatternName, selectedFolder, selectionRect, grid, savedPatterns]);

  const deletePattern = useCallback((id: string) => {
    setSavedPatterns((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem('conway-patterns', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const createFolder = useCallback(() => {
    setNewFolderName('');
    setNewFolderIcon('folder');
    setShowNewFolderDialog(true);
  }, []);

  const handleCreateFolderFromDialog = useCallback(() => {
    const name = newFolderName.trim();
    if (!name) return;
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      expanded: true,
      icon: newFolderIcon,
    };
    setFolders((prev) => {
      const updated = [...prev, newFolder];
      localStorage.setItem('conway-folders', JSON.stringify(updated));
      return updated;
    });
    setShowNewFolderDialog(false);
    setNewFolderName('');
    setNewFolderIcon('folder');
  }, [newFolderName, newFolderIcon]);

  const toggleFolder = useCallback((id: string) => {
    setFolders((prev) => {
      const updated = prev.map((f) =>
        f.id === id ? { ...f, expanded: !f.expanded } : f
      );
      localStorage.setItem('conway-folders', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFolders((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      localStorage.setItem('conway-folders', JSON.stringify(updated));
      return updated;
    });
    setSavedPatterns((prev) => {
      const updated = prev.map((p) =>
        p.folderId === id ? { ...p, folderId: undefined } : p
      );
      localStorage.setItem('conway-patterns', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const zoomIn = useCallback(() => {
    if (cellSize >= MAX_CELL_SIZE) return;
    const newCellSize = cellSize + 2;
    const container = containerRef.current;
    if (container) {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        const cx = w / 2;
        const cy = h / 2;
        const factor = newCellSize / cellSize;
        setViewOffset((prev) => ({
          x: cx - (cx - prev.x) * factor,
          y: cy - (cy - prev.y) * factor,
        }));
      }
    }
    setCellSize(newCellSize);
  }, [cellSize]);

  const zoomOut = useCallback(() => {
    if (cellSize <= MIN_CELL_SIZE) return;
    const newCellSize = cellSize - 2;
    const container = containerRef.current;
    if (container) {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        const cx = w / 2;
        const cy = h / 2;
        const factor = newCellSize / cellSize;
        setViewOffset((prev) => ({
          x: cx - (cx - prev.x) * factor,
          y: cy - (cy - prev.y) * factor,
        }));
      }
    }
    setCellSize(newCellSize);
  }, [cellSize]);

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    },
    [zoomIn, zoomOut]
  );

  return (
    <>
      {showIntro ? (
        <IntroOverlay onComplete={() => setShowIntro(false)} />
      ) : (
      <div
        className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden"
        onMouseUp={() => setIsDragging(false)}
      >
        <BackgroundOverlay />
      <SidebarToggle sidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <Sidebar
        sidebarOpen={sidebarOpen}
        savedPatterns={savedPatterns}
        folders={folders}
        patternToPlace={patternToPlace}
        onLoadPattern={loadPattern}
        onSelectPresetForPlacement={setPatternToPlace}
        onDeletePattern={deletePattern}
        onCreateFolder={createFolder}
        onToggleFolder={toggleFolder}
        onDeleteFolder={deleteFolder}
      />

      <div className="flex-1 flex flex-col relative min-w-0 transition-[width] duration-300 ease-in-out">
        <Controls
          sidebarOpen={sidebarOpen}
          isRunning={isRunning}
          isEditMode={isEditMode}
          isSelectionMode={isSelectionMode}
          generation={generation}
          speed={speed}
          cellSize={cellSize}
          onToggleRun={() => {
            setIsRunning(!isRunning);
            if (isEditMode) setIsEditMode(false);
            if (isSelectionMode) setIsSelectionMode(false);
          }}
          onToggleEdit={() => {
            setIsEditMode(!isEditMode);
            if (!isEditMode) {
              setIsRunning(false);
              setIsSelectionMode(false);
            }
          }}
          onToggleSelection={() => {
            if (!isRunning) {
              setIsSelectionMode(!isSelectionMode);
              if (!isSelectionMode) setSelectionRect(null);
            }
          }}
          onClearGrid={clearGrid}
          onRandomize={randomize}
          onSave={() => setShowSaveDialog(true)}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onSpeedChange={setSpeed}
        />

        <GameGrid
          grid={grid}
          setGrid={setGrid}
          cellSize={cellSize}
          viewOffset={viewOffset}
          setViewOffset={setViewOffset}
          selectionRect={selectionRect}
          setSelectionRect={setSelectionRect}
          isEditMode={isEditMode}
          isSelectionMode={isSelectionMode}
          isPanning={isPanning}
          setIsPanning={setIsPanning}
          panStart={panStart}
          setPanStart={setPanStart}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          dragMode={dragMode}
          setDragMode={setDragMode}
          isSelectingRect={isSelectingRect}
          setIsSelectingRect={setIsSelectingRect}
          patternToPlace={patternToPlace}
          placementRotation={placementRotation}
          onPlacePattern={placePatternAt}
          onRotatePlacement={rotatePlacement}
          containerRef={containerRef}
          canvasRef={canvasRef}
          panBoundsRef={panBoundsRef}
          onToggleCell={toggleCell}
          onWheel={handleWheel}
        />
      </div>

      <AnimatePresence>
        {showSaveDialog && (
          <SaveDialog
            open={showSaveDialog}
            newPatternName={newPatternName}
            selectedFolder={selectedFolder}
            folders={folders}
            selectionRect={selectionRect}
            onClose={() => {
              setShowSaveDialog(false);
              setNewPatternName('');
              setSelectedFolder('');
            }}
            onNameChange={setNewPatternName}
            onFolderChange={setSelectedFolder}
            onSave={saveCurrentPattern}
          />
        )}
        {showNewFolderDialog && (
          <NewFolderDialog
            open={showNewFolderDialog}
            folderName={newFolderName}
            selectedIconId={newFolderIcon}
            onClose={() => {
              setShowNewFolderDialog(false);
              setNewFolderName('');
              setNewFolderIcon('folder');
            }}
            onNameChange={setNewFolderName}
            onIconChange={setNewFolderIcon}
            onCreate={handleCreateFolderFromDialog}
          />
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.3); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.3); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6, 182, 212, 0.5); }
      `}</style>
      </div>
      )}
    </>
  );
}

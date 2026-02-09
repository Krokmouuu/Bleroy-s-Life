import React, { useEffect, useRef, useState, type RefObject } from 'react';
import type { Pattern, SelectionRect } from '../types';

interface GameGridProps {
  grid: boolean[][];
  setGrid: React.Dispatch<React.SetStateAction<boolean[][]>>;
  gridSize: number;
  cellSize: number;
  viewOffset: { x: number; y: number };
  setViewOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  selectionRect: SelectionRect | null;
  setSelectionRect: React.Dispatch<React.SetStateAction<SelectionRect | null>>;
  isEditMode: boolean;
  isSelectionMode: boolean;
  isPanning: boolean;
  setIsPanning: React.Dispatch<React.SetStateAction<boolean>>;
  panStart: { x: number; y: number };
  setPanStart: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  dragMode: 'draw' | 'erase';
  setDragMode: React.Dispatch<React.SetStateAction<'draw' | 'erase'>>;
  isSelectingRect: boolean;
  setIsSelectingRect: React.Dispatch<React.SetStateAction<boolean>>;
  patternToPlace: Pattern | null;
  placementRotation: number;
  onPlacePattern: (anchorX: number, anchorY: number) => void;
  onRotatePlacement: (delta: number) => void;
  containerRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  panBoundsRef: RefObject<{ minX: number; maxX: number; minY: number; maxY: number }>;
  onToggleCell: (x: number, y: number) => void;
  onWheel: (e: React.WheelEvent<HTMLCanvasElement>) => void;
}

export function GameGrid({
  grid,
  setGrid,
  gridSize,
  cellSize,
  viewOffset,
  setViewOffset,
  selectionRect,
  setSelectionRect,
  isEditMode,
  isSelectionMode,
  isPanning,
  setIsPanning,
  panStart,
  setPanStart,
  isDragging,
  setIsDragging,
  dragMode,
  setDragMode,
  isSelectingRect,
  setIsSelectingRect,
  patternToPlace,
  placementRotation,
  onPlacePattern,
  onRotatePlacement,
  containerRef,
  canvasRef,
  panBoundsRef,
  onToggleCell,
  onWheel,
}: GameGridProps) {
  const [ghostAnchor, setGhostAnchor] = useState<{ x: number; y: number } | null>(null);

  const rotateCell = (dx: number, dy: number, rot: number): [number, number] => {
    const r = ((rot % 4) + 4) % 4;
    if (r === 0) return [dx, dy];
    if (r === 1) return [dy, -dx];
    if (r === 2) return [-dx, -dy];
    return [-dy, dx];
  };

  useEffect(() => {
    if (!patternToPlace) setGhostAnchor(null);
  }, [patternToPlace]);

  // Draw grid on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = containerRef.current;
    if (!container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const gridPx = gridSize * cellSize;
    const minX = -gridPx;
    const maxX = canvas.width;
    const minY = -gridPx;
    const maxY = canvas.height;
    if (panBoundsRef.current) {
      panBoundsRef.current.minX = minX;
      panBoundsRef.current.maxX = maxX;
      panBoundsRef.current.minY = minY;
      panBoundsRef.current.maxY = maxY;
    }

    if (viewOffset.x < minX || viewOffset.x > maxX || viewOffset.y < minY || viewOffset.y > maxY) {
      setViewOffset({
        x: Math.max(minX, Math.min(maxX, viewOffset.x)),
        y: Math.max(minY, Math.min(maxY, viewOffset.y)),
      });
    }

    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width
    );
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#020617');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.lineWidth = 0.5;

    const startX = Math.floor(-viewOffset.x / cellSize);
    const startY = Math.floor(-viewOffset.y / cellSize);
    const endX = Math.min(gridSize, startX + Math.ceil(canvas.width / cellSize) + 1);
    const endY = Math.min(gridSize, startY + Math.ceil(canvas.height / cellSize) + 1);

    if (cellSize >= 6) {
      for (let i = Math.max(0, startX); i <= endX; i++) {
        const x = i * cellSize + viewOffset.x;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let i = Math.max(0, startY); i <= endY; i++) {
        const y = i * cellSize + viewOffset.y;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    for (let x = Math.max(0, startX); x < endX; x++) {
      for (let y = Math.max(0, startY); y < endY; y++) {
        if (grid[x] && grid[x][y]) {
          const drawX = x * cellSize + viewOffset.x + 1;
          const drawY = y * cellSize + viewOffset.y + 1;
          ctx.shadowBlur = cellSize / 2;
          ctx.shadowColor = '#06b6d4';
          const cellGradient = ctx.createLinearGradient(
            drawX,
            drawY,
            drawX + cellSize - 2,
            drawY + cellSize - 2
          );
          cellGradient.addColorStop(0, '#06b6d4');
          cellGradient.addColorStop(1, '#0891b2');
          ctx.fillStyle = cellGradient;
          ctx.fillRect(drawX, drawY, cellSize - 2, cellSize - 2);
          ctx.shadowBlur = 0;
        }
      }
    }

    if (selectionRect) {
      const sMinX = Math.min(selectionRect.startX, selectionRect.endX);
      const sMaxX = Math.max(selectionRect.startX, selectionRect.endX);
      const sMinY = Math.min(selectionRect.startY, selectionRect.endY);
      const sMaxY = Math.max(selectionRect.startY, selectionRect.endY);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.1)';
      ctx.fillRect(
        sMinX * cellSize + viewOffset.x,
        sMinY * cellSize + viewOffset.y,
        (sMaxX - sMinX + 1) * cellSize,
        (sMaxY - sMinY + 1) * cellSize
      );
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(
        sMinX * cellSize + viewOffset.x,
        sMinY * cellSize + viewOffset.y,
        (sMaxX - sMinX + 1) * cellSize,
        (sMaxY - sMinY + 1) * cellSize
      );
      ctx.setLineDash([]);
    }

    // Fantôme du pattern à placer (avec rotation)
    if (patternToPlace && ghostAnchor) {
      const rot = ((placementRotation % 4) + 4) % 4;
      ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.lineWidth = 1;
      patternToPlace.cells.forEach(([dx, dy]) => {
        const [rx, ry] = rotateCell(dx, dy, rot);
        const gx = (ghostAnchor.x + rx + gridSize) % gridSize;
        const gy = (ghostAnchor.y + ry + gridSize) % gridSize;
        if (gx >= 0 && gx < gridSize && gy >= 0 && gy < gridSize) {
          const drawX = gx * cellSize + viewOffset.x + 1;
          const drawY = gy * cellSize + viewOffset.y + 1;
          ctx.fillRect(drawX, drawY, cellSize - 2, cellSize - 2);
          ctx.strokeRect(drawX, drawY, cellSize - 2, cellSize - 2);
        }
      });
    }
  }, [grid, gridSize, cellSize, viewOffset, selectionRect, patternToPlace, ghostAnchor, placementRotation, setViewOffset, containerRef, canvasRef, panBoundsRef]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const gridX = Math.floor((x - viewOffset.x) / cellSize);
    const gridY = Math.floor((y - viewOffset.y) / cellSize);

    if (gridX < 0 || gridX >= gridSize || gridY < 0 || gridY >= gridSize) return;

    if (patternToPlace && e.button === 0) {
      e.preventDefault();
      onPlacePattern(gridX, gridY);
      return;
    }

    if (e.button === 2 || e.shiftKey) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      canvas.requestPointerLock();
      return;
    }

    if (!isEditMode && !isSelectionMode && e.button === 0) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      canvas.requestPointerLock();
      return;
    }

    if (isSelectionMode) {
      setIsSelectingRect(true);
      setSelectionRect({ startX: gridX, startY: gridY, endX: gridX, endY: gridY });
    } else if (isEditMode) {
      setIsDragging(true);
      setDragMode(grid[gridX][gridY] ? 'erase' : 'draw');
      onToggleCell(gridX, gridY);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      if (w <= 0 || h <= 0) return;
      const bounds = panBoundsRef.current;
      if (!bounds) return;
      const { minX, maxX, minY, maxY } = bounds;
      const dx =
        document.pointerLockElement === canvas ? e.movementX : e.clientX - panStart.x;
      const dy =
        document.pointerLockElement === canvas ? e.movementY : e.clientY - panStart.y;
      setViewOffset((prev) => ({
        x: Math.max(minX, Math.min(maxX, prev.x + dx)),
        y: Math.max(minY, Math.min(maxY, prev.y + dy)),
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const gridX = Math.floor((x - viewOffset.x) / cellSize);
    const gridY = Math.floor((y - viewOffset.y) / cellSize);
    if (gridX < 0 || gridX >= gridSize || gridY < 0 || gridY >= gridSize) {
      if (patternToPlace) setGhostAnchor(null);
      return;
    }

    if (patternToPlace) {
      setGhostAnchor({ x: gridX, y: gridY });
      return;
    }

    if (isSelectingRect && selectionRect) {
      setSelectionRect((prev) =>
        prev ? { ...prev, endX: gridX, endY: gridY } : null
      );
    } else if (isDragging && isEditMode && !isSelectionMode) {
      setGrid((g) => {
        const newGrid = g.map((row) => [...row]);
        newGrid[gridX][gridY] = dragMode === 'draw';
        return newGrid;
      });
    }
  };

  const handleCanvasMouseUp = () => {
    if (document.pointerLockElement === canvasRef.current) {
      document.exitPointerLock();
    }
    setIsDragging(false);
    setIsPanning(false);
    setIsSelectingRect(false);
  };

  const handleCanvasMouseLeave = () => {
    handleCanvasMouseUp();
    if (patternToPlace) setGhostAnchor(null);
  };

  // Listener wheel en non-passif pour pouvoir appeler preventDefault (zoom / rotation)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      if (patternToPlace) {
        onRotatePlacement(e.deltaY > 0 ? 1 : -1);
      } else {
        onWheel(e as unknown as React.WheelEvent<HTMLCanvasElement>);
      }
    };
    canvas.addEventListener('wheel', handler, { passive: false });
    return () => canvas.removeEventListener('wheel', handler);
  }, [patternToPlace, onRotatePlacement, onWheel, canvasRef]);

  return (
    <div className="flex-1 overflow-hidden relative" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseLeave}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          cursor: patternToPlace
            ? 'crosshair'
            : isPanning
              ? 'grabbing'
              : isSelectionMode
                ? 'crosshair'
                : isEditMode
                  ? 'cell'
                  : 'grab',
        }}
      />
    </div>
  );
}

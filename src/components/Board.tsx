import React, { useRef, useState, useEffect } from 'react';
import { MahjongTile } from '../types.ts';
import { TileView } from './TileView.tsx';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface BoardProps {
  tiles: MahjongTile[];
  freeTileIds: string[];
  selectedTileIds: string[];
  hintTileIds: string[];
  onTileClick: (tile: MahjongTile) => void;
}

export const Board: React.FC<BoardProps> = ({
  tiles,
  freeTileIds,
  selectedTileIds,
  hintTileIds,
  onTileClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 480,
  });

  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update container size dynamically via ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Board layout bounds
  const GRID_COLS = 22; // 0 to 20 + padding
  const GRID_ROWS = 14; // 2 to 12 + padding

  // Calculate base unit size to fit nicely in available space
  const baseUnitX = (dimensions.width - 24) / GRID_COLS;
  const baseUnitY = (dimensions.height - 24) / GRID_ROWS;
  const baseUnitSize = Math.max(14, Math.min(baseUnitX, baseUnitY, 38));
  const unitSize = baseUnitSize * zoomScale;

  const totalBoardWidth = GRID_COLS * unitSize;
  const totalBoardHeight = GRID_ROWS * unitSize;

  // Center the board in container
  const boardOffsetX = Math.max(12, (dimensions.width - totalBoardWidth) / 2) + panOffset.x;
  const boardOffsetY = Math.max(12, (dimensions.height - totalBoardHeight) / 2) + panOffset.y;

  // Pan interaction handlers (for mobile dragging & desktop inspection)
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only pan if clicking empty board background
    if ((e.target as HTMLElement).closest('[id^="tile-"]')) return;
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y,
    });
  };

  const handlePointerUp = () => {
    setIsPanning(false);
  };

  const resetView = () => {
    setZoomScale(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  // Sort tiles for natural DOM paint order:
  // Layer ascending, then Row ascending, then Col ascending
  const sortedTiles = [...tiles].sort((a, b) => {
    if (a.layer !== b.layer) return a.layer - b.layer;
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });

  const selectedSet = new Set(selectedTileIds);
  const freeSet = new Set(freeTileIds);
  const hintSet = new Set(hintTileIds);

  return (
    <div
      ref={containerRef}
      id="mahjong-board-container"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="relative w-full flex-1 min-h-[360px] md:min-h-[460px] rounded-2xl bg-gradient-to-b from-[#1b3a2f] via-[#152e25] to-[#0e211a] border border-emerald-900/60 shadow-inner overflow-hidden select-none touch-none isolate z-0"
    >
      {/* Felt Texture & Radial Table Light */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-800/25 via-transparent to-black/60 pointer-events-none" />

      {/* Floating Zoom Controls */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-stone-900/80 backdrop-blur-sm border border-stone-700/80 rounded-xl p-1 shadow-lg">
        <button
          id="btn-zoom-in"
          type="button"
          onClick={() => setZoomScale((s) => Math.min(1.8, s + 0.15))}
          className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 active:scale-95 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="btn-zoom-out"
          type="button"
          onClick={() => setZoomScale((s) => Math.max(0.7, s - 0.15))}
          className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 active:scale-95 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          id="btn-zoom-reset"
          type="button"
          onClick={resetView}
          className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 active:scale-95 transition"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Tiles Render Area */}
      <div className="relative w-full h-full">
        {sortedTiles.map((tile) => (
          <TileView
            key={tile.id}
            tile={tile}
            isFree={freeSet.has(tile.id)}
            isSelected={selectedSet.has(tile.id)}
            isHinted={hintSet.has(tile.id)}
            unitSize={unitSize}
            boardOffsetX={boardOffsetX}
            boardOffsetY={boardOffsetY}
            onClick={onTileClick}
          />
        ))}
      </div>
    </div>
  );
};

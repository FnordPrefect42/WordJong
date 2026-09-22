import React from 'react';
import { MahjongTile } from '../types.ts';

interface TileViewProps {
  tile: MahjongTile;
  isFree: boolean;
  isSelected: boolean;
  isHinted: boolean;
  unitSize: number; // Pixels per grid unit
  boardOffsetX: number;
  boardOffsetY: number;
  onClick: (tile: MahjongTile) => void;
}

export const TileView: React.FC<TileViewProps> = ({
  tile,
  isFree,
  isSelected,
  isHinted,
  unitSize,
  boardOffsetX,
  boardOffsetY,
  onClick,
}) => {
  if (tile.isRemoved) {
    return null;
  }

  // 3D layer visual offset
  const layerOffset = tile.layer * (unitSize * 0.14);
  const left = boardOffsetX + tile.col * unitSize - layerOffset;
  const top = boardOffsetY + tile.row * unitSize - layerOffset;
  const width = tile.width * unitSize;
  const height = tile.height * unitSize;

  // Stacking z-index: Higher layer and lower row comes forward
  const zIndex = tile.layer * 100 + Math.floor(tile.row * 5) + (isSelected ? 500 : 0);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(tile);
  };

  return (
    <div
      id={`tile-${tile.id}`}
      onClick={handleClick}
      className={`absolute select-none transition-transform duration-150 cursor-pointer ${
        isSelected ? 'opacity-30 pointer-events-none' : ''
      }`}
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex,
      }}
      title={`Tile ${tile.letter} - ${isFree ? 'Free to play' : 'Blocked'}`}
    >
      {/* 3D Tile Shadow */}
      <div
        className="absolute inset-0 rounded-lg pointer-events-none translate-x-1 translate-y-1.5 bg-black/35 blur-[2px]"
      />

      {/* 3D Tile Base / Green or Bone Ivory Side Border */}
      <div
        className="absolute inset-0 rounded-lg bg-stone-300 border border-stone-400 translate-y-1"
        style={{
          boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.25)',
        }}
      />

      {/* Tile Face */}
      <div
        className={`absolute inset-0 rounded-lg flex flex-col items-center justify-center p-1 transition-all duration-150 ${
          isFree
            ? 'bg-gradient-to-b from-[#fffff7] via-[#faf6ee] to-[#f0e8d5] text-stone-900 border border-[#e4d7b8] shadow-sm hover:brightness-105 active:scale-95'
            : 'bg-gradient-to-b from-[#e8e2d4] via-[#dfd8c7] to-[#cfc6b2] text-stone-500 border border-[#c2b9a3] brightness-90 cursor-not-allowed'
        } ${
          isHinted
            ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-stone-900 animate-pulse !border-amber-400'
            : ''
        }`}
        style={{
          boxShadow: isFree
            ? 'inset 0 1px 1px rgba(255,255,255,0.9), 0 2px 4px rgba(0,0,0,0.15)'
            : 'inset 0 1px 2px rgba(0,0,0,0.2)',
        }}
      >
        {/* Letter */}
        <span
          className={`font-black tracking-tight leading-none ${
            isFree ? 'text-stone-900' : 'text-stone-500'
          }`}
          style={{
            fontSize: `${Math.max(16, unitSize * 0.95)}px`,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {tile.letter}
        </span>

        {/* Lock Overlay Icon if tile is blocked */}
        {!isFree && (
          <div className="absolute top-1 left-1.5 opacity-40">
            <svg
              className="w-2.5 h-2.5 text-stone-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
          </div>
        )}

        {/* Subtle Layer Indicator Dot */}
        {tile.layer > 0 && (
          <div
            className="absolute top-1 right-1 flex space-x-0.5 opacity-60"
            title={`Layer ${tile.layer + 1}`}
          >
            {Array.from({ length: tile.layer }).map((_, i) => (
              <span key={i} className="w-1 h-1 rounded-full bg-emerald-600" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

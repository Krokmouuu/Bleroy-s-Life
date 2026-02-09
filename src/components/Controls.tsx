import React from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Edit3,
  Save,
  ZoomIn,
  ZoomOut,
  Sparkles,
  MousePointer2,
} from 'lucide-react';
import { MIN_CELL_SIZE, MAX_CELL_SIZE } from '../types';

interface ControlsProps {
  sidebarOpen: boolean;
  isRunning: boolean;
  isEditMode: boolean;
  isSelectionMode: boolean;
  generation: number;
  speed: number;
  cellSize: number;
  onToggleRun: () => void;
  onToggleEdit: () => void;
  onToggleSelection: () => void;
  onClearGrid: () => void;
  onRandomize: () => void;
  onSave: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSpeedChange: (value: number) => void;
}

export function Controls({
  sidebarOpen,
  isRunning,
  isEditMode,
  isSelectionMode,
  generation,
  speed,
  cellSize,
  onToggleRun,
  onToggleEdit,
  onToggleSelection,
  onClearGrid,
  onRandomize,
  onSave,
  onZoomIn,
  onZoomOut,
  onSpeedChange,
}: ControlsProps) {
  const rowClass = sidebarOpen
    ? 'flex items-center gap-3 mb-4 flex-wrap transition-[justify-content] duration-300 ease-in-out'
    : 'flex items-center justify-center gap-3 mb-4 flex-wrap transition-[justify-content] duration-300 ease-in-out';
  const secondRowClass = sidebarOpen
    ? 'flex items-center gap-4 transition-[justify-content] duration-300 ease-in-out'
    : 'flex items-center justify-center gap-4 transition-[justify-content] duration-300 ease-in-out';
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20 }}
      className="bg-slate-900/80 backdrop-blur-xl border-b border-cyan-500/20 p-4 shadow-lg shadow-cyan-500/5"
    >
      <div className={rowClass}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleRun}
          className={`px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all shadow-lg ${
            isRunning
              ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-orange-500/50'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/50'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Démarrer
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleEdit}
          className={`px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all shadow-lg ${
            isEditMode
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/50'
              : 'bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Édition
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSelection}
          disabled={isRunning}
          className={`px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
            isSelectionMode
              ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 shadow-yellow-500/50'
              : 'bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50'
          }`}
        >
          <MousePointer2 className="w-4 h-4" />
          Sélection
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClearGrid}
          className="px-5 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center gap-2 font-medium transition-all border border-slate-600/50"
        >
          <RotateCcw className="w-4 h-4" />
          Effacer
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRandomize}
          className="px-5 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg font-medium transition-all border border-slate-600/50"
        >
          Aléatoire
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSave}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-lg flex items-center gap-2 font-medium transition-all shadow-lg shadow-purple-500/50"
        >
          <Save className="w-4 h-4" />
          Sauvegarder
        </motion.button>

        <div className={`flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700/50 ${sidebarOpen ? 'ml-auto' : ''}`}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onZoomOut}
            disabled={cellSize <= MIN_CELL_SIZE}
            className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Dézoomer"
          >
            <ZoomOut className="w-4 h-4" />
          </motion.button>
          <span className="text-sm text-cyan-400 min-w-[60px] text-center font-medium">
            {Math.round((cellSize / 8) * 100)}%
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onZoomIn}
            disabled={cellSize >= MAX_CELL_SIZE}
            className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Zoomer"
          >
            <ZoomIn className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="text-sm bg-slate-800/50 px-4 py-2 rounded-lg border border-cyan-500/30">
          <span className="text-slate-400">Gen:</span>{' '}
          <span className="text-cyan-400 font-mono">{generation}</span>
        </div>
      </div>

      <div className={secondRowClass}>
        <label className="text-sm text-slate-300 font-light">Vitesse</label>
        <input
          type="range"
          min="10"
          max="500"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-48 accent-cyan-500"
        />
        <span className="text-sm text-slate-400 font-mono">{speed}ms</span>
        {isSelectionMode ? (
          <span className="text-xs text-yellow-400 ml-4 flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/30">
            <MousePointer2 className="w-3 h-3" />
            Cliquez et glissez pour sélectionner une zone
          </span>
        ) : (
          <span className="text-xs text-slate-500 ml-4 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Clic ou molette pour naviguer
          </span>
        )}
      </div>
    </motion.div>
  );
}

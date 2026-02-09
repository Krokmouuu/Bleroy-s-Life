import React from 'react';
import { motion } from 'motion/react';
import type { Pattern, Folder, SelectionRect } from '../types';

interface SaveDialogProps {
  open: boolean;
  newPatternName: string;
  selectedFolder: string;
  folders: Folder[];
  selectionRect: SelectionRect | null;
  onClose: () => void;
  onNameChange: (value: string) => void;
  onFolderChange: (folderId: string) => void;
  onSave: () => void;
}

export function SaveDialog({
  open,
  newPatternName,
  selectedFolder,
  folders,
  selectionRect,
  onClose,
  onNameChange,
  onFolderChange,
  onSave,
}: SaveDialogProps) {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 w-96 border border-cyan-500/30 shadow-2xl shadow-cyan-500/20"
      >
        <h3 className="text-xl mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-light">
          Sauvegarder la forme
        </h3>

        {selectionRect && (
          <p className="text-xs text-yellow-400 mb-4 bg-yellow-500/10 px-3 py-2 rounded-lg border border-yellow-500/30">
            Zone sélectionnée active - seule cette zone sera sauvegardée
          </p>
        )}

        <input
          type="text"
          value={newPatternName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Nom de la forme"
          className="w-full px-4 py-3 bg-slate-900/50 rounded-lg border border-slate-700/50 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 mb-4 transition-all"
          autoFocus
        />

        <label className="block text-sm text-slate-400 mb-2 font-light">Dossier (optionnel)</label>
        <select
          value={selectedFolder}
          onChange={(e) => onFolderChange(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900/50 rounded-lg border border-slate-700/50 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 mb-6 transition-all"
        >
          <option value="">Aucun dossier</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSave}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/50"
          >
            Sauvegarder
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg font-medium transition-all border border-slate-600/50"
          >
            Annuler
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

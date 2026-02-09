import React from "react";
import { motion } from "motion/react";
import { FOLDER_ICONS } from "../lib/folderIcons";

interface NewFolderDialogProps {
  open: boolean;
  folderName: string;
  selectedIconId: string;
  onClose: () => void;
  onNameChange: (value: string) => void;
  onIconChange: (iconId: string) => void;
  onCreate: () => void;
}

export function NewFolderDialog({
  open,
  folderName,
  selectedIconId,
  onClose,
  onNameChange,
  onIconChange,
  onCreate,
}: NewFolderDialogProps) {
  if (!open) return null;

  const canCreate = folderName.trim().length > 0;

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
          Nouveau dossier
        </h3>

        <label className="block text-sm text-slate-400 mb-2 font-light">
          Nom du dossier
        </label>
        <input
          type="text"
          value={folderName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ex. Mes vaisseaux"
          className="w-full px-4 py-3 bg-slate-900/50 rounded-lg border border-slate-700/50 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 mb-4 transition-all"
          autoFocus
        />

        <label className="block text-sm text-slate-400 mb-2 font-light">
          Icône du dossier
        </label>
        <div className="flex flex-wrap gap-2 mb-6">
          {FOLDER_ICONS.map(({ id, Icon, label }) => {
            const isSelected = (selectedIconId || "folder") === id;
            return (
              <motion.button
                key={id}
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onIconChange(id)}
                title={label}
                className={`flex items-center justify-center w-10 h-10 rounded-full border shrink-0 transition-all ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                    : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400/80"
                }`}
              >
                <Icon className="w-5 h-5" />
              </motion.button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => canCreate && onCreate()}
            disabled={!canCreate}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              canCreate
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/50 cursor-pointer"
                : "bg-slate-700/30 text-slate-500 cursor-not-allowed"
            }`}
          >
            Créer
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

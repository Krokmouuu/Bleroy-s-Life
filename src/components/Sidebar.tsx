import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Folder, ChevronDown, Trash2 } from "lucide-react";
import { FolderIcon } from "../lib/folderIcons";
import { ConwayLogo } from "./ConwayLogo";
import type { Pattern, Folder as FolderType } from "../types";
import { GRID_SIZE, PRESETS, PRESET_FOLDERS } from "../types";

const presetSelectedStyle: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1))",
  borderColor: "rgba(6, 182, 212, 0.3)",
};
const savedSelectedStyle: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))",
  borderColor: "rgba(168, 85, 247, 0.3)",
};

interface SidebarProps {
  sidebarOpen: boolean;
  savedPatterns: Pattern[];
  folders: FolderType[];
  patternToPlace: Pattern | null;
  onLoadPattern: (pattern: Pattern) => void;
  onSelectPresetForPlacement?: (pattern: Pattern) => void;
  onDeletePattern: (id: string) => void;
  onCreateFolder: () => void;
  onToggleFolder: (id: string) => void;
  onDeleteFolder: (id: string) => void;
}

export function Sidebar({
  sidebarOpen,
  savedPatterns,
  folders,
  patternToPlace,
  onLoadPattern,
  onSelectPresetForPlacement,
  onDeletePattern,
  onCreateFolder,
  onToggleFolder,
  onDeleteFolder,
}: SidebarProps) {
  return (
    <motion.div
      initial={false}
      animate={{ width: sidebarOpen ? 320 : 0 }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      className="bg-slate-900/80 backdrop-blur-xl border-r border-cyan-500/20 flex flex-col h-full min-h-0 relative z-10 shadow-2xl shadow-cyan-500/10 overflow-hidden shrink-0"
    >
      <motion.div
        className="w-80 min-w-80 flex flex-col flex-1 min-h-0 overflow-hidden"
        initial={false}
        animate={{
          opacity: sidebarOpen ? 1 : 0,
          x: sidebarOpen ? 0 : -16,
        }}
        transition={{
          duration: sidebarOpen ? 0.3 : 0.2,
          delay: sidebarOpen ? 0.08 : 0,
          ease: [0.32, 0.72, 0, 1],
        }}
      >
        <div className="p-6 pt-20 border-b border-cyan-500/20 bg-gradient-to-br from-slate-800/50 to-slate-900/50 shrink-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="flex items-center justify-center">
              <ConwayLogo style={{ width: 50, height: 50 }} />
            </div>
            <div>
              <h1 className="text-xl font-light tracking-wider bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Bleroy's Life
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                Grille {GRID_SIZE}×{GRID_SIZE}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 space-y-6 custom-scrollbar">
          <PresetsSection
            selectedPatternId={patternToPlace?.id ?? null}
            onSelectPresetForPlacement={
              onSelectPresetForPlacement ?? onLoadPattern
            }
          />
          <SavedPatternsSection
            savedPatterns={savedPatterns}
            folders={folders}
            selectedPatternId={patternToPlace?.id ?? null}
            onSelectPatternForPlacement={
              onSelectPresetForPlacement ?? onLoadPattern
            }
            onDeletePattern={onDeletePattern}
            onCreateFolder={onCreateFolder}
            onToggleFolder={onToggleFolder}
            onDeleteFolder={onDeleteFolder}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

const presetBtnBase =
  "w-full text-left px-4 py-2.5 rounded-lg border text-sm backdrop-blur-sm cursor-pointer transition-none";
const presetBtnNormalStyle =
  "bg-slate-800/50 border-slate-700/50 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 hover:border-cyan-500/30";

function PresetButton({
  pattern,
  isSelected,
  onSelect,
}: {
  pattern: Pattern;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      key={`${pattern.id}-${isSelected ? "sel" : "off"}`}
      type="button"
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: 1,
        x: isSelected ? 4 : 0,
        scale: isSelected ? 1.02 : 1,
      }}
      transition={{ duration: 0, delay: 0 }}
      whileHover={!isSelected ? { scale: 1.02, x: 4 } : undefined}
      whileTap={{ scale: 0.98, transition: { duration: 0, delay: 0 } }}
      onClick={onSelect}
      style={isSelected ? presetSelectedStyle : undefined}
      className={`${presetBtnBase} ${isSelected ? "" : presetBtnNormalStyle}`}
    >
      {pattern.name}
    </motion.button>
  );
}

function PresetsSection({
  selectedPatternId,
  onSelectPresetForPlacement,
}: {
  selectedPatternId: string | null;
  onSelectPresetForPlacement: (pattern: Pattern) => void;
}) {
  const [presetFolderExpanded, setPresetFolderExpanded] = useState<
    Record<string, boolean>
  >(() => Object.fromEntries(PRESET_FOLDERS.map((f) => [f.id, f.expanded])));

  const presetsWithoutFolder = PRESETS.filter((p) => !p.folderId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-xs uppercase tracking-wider mb-3 text-cyan-400/80 font-light">
        Presets
      </h2>
      <p className="text-xs text-slate-500 mb-2">
        Cliquez pour choisir une forme, puis cliquez sur la grille pour la
        placer. Rotation avec R ou les flèches ← →.
      </p>
      <div className="space-y-1.5">
        {presetsWithoutFolder.map((pattern) => (
          <React.Fragment key={pattern.id}>
            <PresetButton
              pattern={pattern}
              isSelected={selectedPatternId === pattern.id}
              onSelect={() => onSelectPresetForPlacement(pattern)}
            />
          </React.Fragment>
        ))}

        {PRESET_FOLDERS.map((folder) => {
          const presetsInFolder = PRESETS.filter(
            (p) => p.folderId === folder.id,
          );
          if (presetsInFolder.length === 0) return null;
          const expanded = presetFolderExpanded[folder.id] ?? folder.expanded;
          return (
            <motion.div
              key={folder.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  setPresetFolderExpanded((prev) => ({
                    ...prev,
                    [folder.id]: !expanded,
                  }))
                }
                className="flex w-full items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800/50 hover:bg-cyan-500/5 border border-slate-700/50 hover:border-cyan-500/30 text-sm text-left cursor-pointer"
              >
                <motion.div
                  animate={{ rotate: expanded ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-cyan-400" />
                </motion.div>
                <Folder className="w-4 h-4 text-cyan-400" />
                {folder.name}
              </motion.button>
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-6 space-y-1.5 mt-1.5 overflow-hidden"
                  >
                    {presetsInFolder.map((pattern) => (
                      <React.Fragment key={pattern.id}>
                        <PresetButton
                          pattern={pattern}
                          isSelected={selectedPatternId === pattern.id}
                          onSelect={() => onSelectPresetForPlacement(pattern)}
                        />
                      </React.Fragment>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

interface SavedPatternsSectionProps {
  savedPatterns: Pattern[];
  folders: FolderType[];
  selectedPatternId: string | null;
  onSelectPatternForPlacement: (pattern: Pattern) => void;
  onDeletePattern: (id: string) => void;
  onCreateFolder: () => void;
  onToggleFolder: (id: string) => void;
  onDeleteFolder: (id: string) => void;
}

function SavedPatternsSection({
  savedPatterns,
  folders,
  selectedPatternId,
  onSelectPatternForPlacement,
  onDeletePattern,
  onCreateFolder,
  onToggleFolder,
  onDeleteFolder,
}: SavedPatternsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs uppercase tracking-wider text-cyan-400/80 font-light">
          Mes Formes
        </h2>
        <motion.button
          type="button"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={onCreateFolder}
          className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all cursor-pointer"
          title="Nouveau dossier"
        >
          <Folder className="w-4 h-4 text-cyan-400" />
        </motion.button>
      </div>

      <div className="space-y-1.5">
        {savedPatterns
          .filter((p) => !p.folderId)
          .map((pattern, index) => {
            const isSelected = selectedPatternId === pattern.id;
            const savedBtnNormalStyle =
              "bg-slate-800/50 border-slate-700/50 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 hover:border-purple-500/30";
            return (
              <motion.div
                key={pattern.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2 group"
              >
                <motion.button
                  key={`${pattern.id}-${isSelected ? "sel" : "off"}`}
                  type="button"
                  animate={{
                    x: isSelected ? 4 : 0,
                    scale: isSelected ? 1.02 : 1,
                  }}
                  transition={{ duration: 0, delay: 0 }}
                  whileHover={!isSelected ? { scale: 1.02, x: 4 } : undefined}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectPatternForPlacement(pattern)}
                  style={isSelected ? savedSelectedStyle : undefined}
                  className={`flex-1 text-left px-4 py-2.5 rounded-lg border text-sm transition-none cursor-pointer ${isSelected ? "" : savedBtnNormalStyle}`}
                >
                  {pattern.name}
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDeletePattern(pattern.id)}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </motion.button>
              </motion.div>
            );
          })}

        {folders.map((folder) => (
          <motion.div
            key={folder.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-1 group">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onToggleFolder(folder.id)}
                className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800/50 hover:bg-cyan-500/5 border border-slate-700/50 hover:border-cyan-500/30 text-sm transition-all cursor-pointer"
              >
                <motion.div
                  animate={{ rotate: folder.expanded ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-cyan-400" />
                </motion.div>
                <FolderIcon
                  iconId={folder.icon}
                  className="w-4 h-4 text-cyan-400"
                />
                {folder.name}
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDeleteFolder(folder.id)}
                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </motion.button>
            </div>

            <AnimatePresence>
              {folder.expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-6 space-y-1.5 mt-1.5 overflow-hidden"
                >
                  {savedPatterns
                    .filter((p) => p.folderId === folder.id)
                    .map((pattern) => {
                      const isSelected = selectedPatternId === pattern.id;
                      const folderBtnNormalStyle =
                        "bg-slate-800/30 border-slate-700/30 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 hover:border-purple-500/30";
                      return (
                        <motion.div
                          key={pattern.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex items-center gap-2 group"
                        >
                          <motion.button
                            key={`${pattern.id}-${isSelected ? "sel" : "off"}`}
                            type="button"
                            animate={{
                              x: isSelected ? 4 : 0,
                              scale: isSelected ? 1.02 : 1,
                            }}
                            transition={{ duration: 0, delay: 0 }}
                            whileHover={
                              !isSelected ? { scale: 1.02, x: 4 } : undefined
                            }
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelectPatternForPlacement(pattern)}
                            style={isSelected ? savedSelectedStyle : undefined}
                            className={`flex-1 text-left px-4 py-2 rounded-lg border text-sm transition-none cursor-pointer ${isSelected ? "" : folderBtnNormalStyle}`}
                          >
                            {pattern.name}
                          </motion.button>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDeletePattern(pattern.id)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </motion.button>
                        </motion.div>
                      );
                    })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

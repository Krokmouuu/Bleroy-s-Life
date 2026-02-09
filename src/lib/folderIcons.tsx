import React from "react";
import {
  Folder,
  FolderOpen,
  Star,
  Heart,
  Bookmark,
  Tag,
  Box,
  Grid3X3,
  Layers,
  Archive,
  type LucideIcon,
} from "lucide-react";

export const FOLDER_ICONS: { id: string; Icon: LucideIcon; label: string }[] = [
  { id: "folder", Icon: Folder, label: "Dossier" },
  { id: "folder-open", Icon: FolderOpen, label: "Dossier ouvert" },
  { id: "star", Icon: Star, label: "Étoile" },
  { id: "heart", Icon: Heart, label: "Cœur" },
  { id: "bookmark", Icon: Bookmark, label: "Favori" },
  { id: "tag", Icon: Tag, label: "Tag" },
  { id: "box", Icon: Box, label: "Boîte" },
  { id: "grid", Icon: Grid3X3, label: "Grille" },
  { id: "layers", Icon: Layers, label: "Calques" },
  { id: "archive", Icon: Archive, label: "Archive" },
];

const DEFAULT_ICON_ID = "folder";

export function FolderIcon({
  iconId,
  className,
}: {
  iconId?: string;
  className?: string;
}) {
  const entry = FOLDER_ICONS.find((e) => e.id === (iconId || DEFAULT_ICON_ID));
  const Icon = entry?.Icon ?? Folder;
  return <Icon className={className} />;
}

/** Taille par défaut de la grille (carrée). */
export const DEFAULT_GRID_SIZE = 500;
export const MIN_GRID_SIZE = 100;
export const MAX_GRID_SIZE = 2000;

export const MIN_CELL_SIZE = 4; // 50% zoom minimum
export const MAX_CELL_SIZE = 40;

export interface Pattern {
  id: string;
  name: string;
  cells: [number, number][];
  width?: number;
  height?: number;
  folderId?: string;
}

export interface Folder {
  id: string;
  name: string;
  expanded: boolean;
  icon?: string;
}
export interface PresetFolder {
  id: string;
  name: string;
  expanded: boolean;
}

export const PRESET_FOLDERS: PresetFolder[] = [];

export interface SelectionRect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export const PRESETS: Pattern[] = [
  { id: "glider", name: "Glider", cells: [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]] },
  { id: "blinker", name: "Blinker", cells: [[1, 0], [1, 1], [1, 2]] },
  { id: "toad", name: "Toad", cells: [[1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2]] },
  { id: "beacon", name: "Beacon", cells: [[0, 0], [1, 0], [0, 1], [3, 2], [2, 3], [3, 3]] },
  {
    id: "pulsar",
    name: "Pulsar",
    cells: [
      [2, 0], [3, 0], [4, 0], [8, 0], [9, 0], [10, 0],
      [0, 2], [5, 2], [7, 2], [12, 2], [0, 3], [5, 3], [7, 3], [12, 3],
      [0, 4], [5, 4], [7, 4], [12, 4], [2, 5], [3, 5], [4, 5], [8, 5], [9, 5], [10, 5],
      [2, 7], [3, 7], [4, 7], [8, 7], [9, 7], [10, 7], [0, 8], [5, 8], [7, 8], [12, 8],
      [0, 9], [5, 9], [7, 9], [12, 9], [0, 10], [5, 10], [7, 10], [12, 10],
      [2, 12], [3, 12], [4, 12], [8, 12], [9, 12], [10, 12],
    ],
  },
  {
    id: "glider-gun",
    name: "Glider Gun",
    cells: [
      [24, 0], [22, 1], [24, 1], [12, 2], [13, 2], [20, 2], [21, 2], [34, 2], [35, 2],
      [11, 3], [15, 3], [20, 3], [21, 3], [34, 3], [35, 3], [0, 4], [1, 4], [10, 4],
      [16, 4], [20, 4], [21, 4], [0, 5], [1, 5], [10, 5], [14, 5], [16, 5], [17, 5],
      [22, 5], [24, 5], [10, 6], [16, 6], [24, 6], [11, 7], [15, 7], [12, 8], [13, 8],
    ],
  },
  { id: "block", name: "Block", cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
  { id: "beehive", name: "Beehive", cells: [[1, 0], [2, 0], [0, 1], [3, 1], [1, 2], [2, 2]] },
  { id: "loaf", name: "Loaf", cells: [[1, 0], [2, 0], [0, 1], [3, 1], [1, 2], [3, 2], [2, 3]] },
  { id: "boat", name: "Boat", cells: [[0, 0], [1, 0], [0, 1], [2, 1], [1, 2]] },
  { id: "tub", name: "Tub", cells: [[1, 0], [0, 1], [2, 1], [1, 2]] },
  { id: "pond", name: "Pond", cells: [[1, 0], [2, 0], [0, 1], [3, 1], [0, 2], [3, 2], [1, 3], [2, 3]] },
  { id: "r-pentomino", name: "R-pentomino", cells: [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]] },
  { id: "acorn", name: "Acorn", cells: [[1, 0], [3, 1], [0, 2], [1, 2], [4, 2], [5, 2], [6, 2]] },
  { id: "diehard", name: "Diehard", cells: [[6, 0], [0, 1], [1, 1], [1, 2], [5, 2], [6, 2], [7, 2]] },
  {
    id: "pentadecathlon",
    name: "Pentadecathlon",
    cells: [
      [2, 0], [6, 0], [0, 1], [1, 1], [3, 1], [4, 1], [5, 1], [6, 1], [8, 1], [9, 1], [2, 2], [6, 2],
    ],
  },
  { id: "b-heptomino", name: "B-heptomino", cells: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [1, 2], [2, 2]] },
  { id: "pi-heptomino", name: "Pi-heptomino", cells: [[1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2]] },
  { id: "f-pentomino", name: "F-pentomino", cells: [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]] },
  { id: "eater1", name: "Eater 1", cells: [[0, 2], [1, 2], [2, 2], [3, 2], [2, 3], [3, 3], [3, 4]] },
  {
    id: "figure-8",
    name: "Figure-8",
    cells: [
      [2, 0], [3, 0], [1, 1], [2, 1], [3, 1], [4, 1], [1, 2], [2, 2], [3, 2], [4, 2], [2, 3], [3, 3],
    ],
  },
  { id: "clock", name: "Clock", cells: [[0, 0], [1, 0], [0, 1]] },
  {
    id: "thunderbird",
    name: "Thunderbird",
    cells: [[0, 1], [1, 1], [2, 1], [1, 2], [1, 3], [1, 4], [1, 5]],
  },
  {
    id: "herschel",
    name: "Herschel",
    cells: [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2], [2, 2], [0, 3]],
  },
  { id: "t-nose", name: "T-nose", cells: [[1, 0], [0, 1], [1, 1], [1, 2]] },
  {
    id: "kok-galaxy",
    name: "Kok's galaxy",
    cells: [
      [2, 0], [3, 0], [5, 0], [6, 0],
      [2, 1], [3, 1], [5, 1], [6, 1],
      [0, 2], [1, 2], [7, 2], [8, 2],
      [0, 3], [1, 3], [7, 3], [8, 3],
      [2, 5], [3, 5], [5, 5], [6, 5],
      [2, 6], [3, 6], [5, 6], [6, 6],
      [0, 7], [1, 7], [7, 7], [8, 7],
      [0, 8], [1, 8], [7, 8], [8, 8],
    ],
  },
];

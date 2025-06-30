/**
 * 代表迷宮中的一個儲存格 (Cell)
 */
export interface Cell {
  x: number;
  y: number;
  // 牆壁是否存在
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  // 在產生過程中是否被訪問過
  visited: boolean;
}

/**
 * 定義可用的迷宮生成演算法類型
 */
export type MazeGenerationAlgorithm = 'recursive-backtracker' | 'recursive-backtracker-biased' | "prim" | "kruskal" | "wilson" | "growing-tree" | "binary-tree";

/**
 * 代表一個點的座標
 */
export interface Point {
  x: number;
  y: number;
}
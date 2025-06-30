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
export type MazeGenerationAlgorithm = 'recursive-backtracker' | 'recursive-backtracker-biased' | "prim" | "kruskal" | "wilson" | "growing-tree" | "binary-tree" | "aldous-broder" | "sidewinder" | "recursive-division";

/**
 * 代表一個點的座標
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 'growing-tree' 演算法的儲存格選擇策略
 * - 'newest': 選擇最新的儲存格 (類似遞迴回溯法)
 * - 'random': 隨機選擇一個儲存格 (類似普林演算法)
 * - 'oldest': 選擇最舊的儲存格 (會產生長廊)
 */
export type GrowingTreeStrategy = 'newest' | 'random' | 'oldest';

/**
 * 'binary-tree' 演算法的偏好方向
 * - 'north-west': 偏向北方和西方
 * - 'north-east': 偏向北方和東方
 * - 'south-west': 偏向南方和西方
 * - 'south-east': 偏向南方和東方
 */
export type BinaryTreeBias = 'north-west' | 'north-east' | 'south-west' | 'south-east';

/**
 * Represents the state of the maze at a single step of generation.
 */
export interface GenerationStep {
  grid: Cell[][];
  // Optional context for visualization
  currentCell?: Cell; // The cell being processed
  activeSet?: Cell[]; // For algorithms like Prim's or Growing Tree
  stack?: Cell[]; // For Recursive Backtracker
  walkPath?: Cell[]; // For Wilson's
}

export type GenerationStepCallback = (step: GenerationStep) => Promise<void> | void;

/**
 * MazeGenerator 的可選設定
 */
export interface MazeGeneratorOptions {
  seed?: number;
  growingTreeStrategy?: GrowingTreeStrategy;
  /**
   * 'recursive-backtracker-biased' 演算法中，選擇直線路徑的偏好機率。
   * 應介於 0.0 (無偏好) 到 1.0 (極強偏好) 之間。
   */
  straightBias?: number;
  binaryTreeBias?: BinaryTreeBias;
  /**
   * A callback function that is invoked at each step of the maze generation process.
   * Useful for visualization.
   */
  onStep?: GenerationStepCallback;
}

/**
 * Represents the state of the maze at a single step of solving.
 */
export interface SolverStep {
  grid: Cell[][];
  // Optional context for visualization
  openSetForward: Cell[];
  closedSetForward: Cell[];
  openSetBackward: Cell[];
  closedSetBackward: Cell[];
  currentForward?: Cell;
  currentBackward?: Cell;
  meetingNode?: Cell;
}

export type SolverStepCallback = (step: SolverStep) => Promise<void> | void;

/**
 * MazeSolver 的可選設定
 */
export interface MazeSolverOptions {
  /**
   * A callback function that is invoked at each step of the maze solving process.
   * Useful for visualization.
   */
  onStep?: SolverStepCallback;
}
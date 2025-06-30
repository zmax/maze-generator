import { MazeGenerator } from './maze-generator';
import { MazeSolver } from './maze-solver';
import { drawMazeToConsole } from './maze-drawer';
import type { MazeGenerationAlgorithm, MazeGeneratorOptions } from './types';

// --- 使用範例 ---

/**
 * 輔助函式：產生、設定出入口並印出迷宮
 * @param width 迷宮寬度
 * @param height 迷宮高度
 */
function createAndSolveMaze(width: number, height: number, algorithm: MazeGenerationAlgorithm, options?: MazeGeneratorOptions): void {
  const seed = options?.seed;
  const gtStrategy = (algorithm === 'growing-tree' && options?.growingTreeStrategy) ? ` (${options.growingTreeStrategy})` : '';
  const algorithmName = algorithm.charAt(0).toUpperCase() + algorithm.slice(1).replace(/-(\w)/g, (g) => g[1].toUpperCase());
  console.log(`\n這是一個 ${width}x${height} 的迷宮 (使用 ${algorithmName}${gtStrategy} 演算法${seed !== undefined ? `，種子: ${seed}` : ''}，包含解答路徑)：`);
  const mazeGenerator = new MazeGenerator(width, height, algorithm, options);
  const mazeData = mazeGenerator.generate();
  const start = { x: 0, y: 0 };
  const end = { x: width - 1, y: height - 1 };

  // 建立入口和出口
  mazeData[start.y][start.x].walls.top = false; // 入口
  mazeData[end.y][end.x].walls.bottom = false; // 出口

  // 解決迷宮
  const solver = new MazeSolver(mazeData);
  const path = solver.solve(start, end);

  drawMazeToConsole(mazeData, path);
}

const mazeSeed = 12345;

createAndSolveMaze(15, 10, 'recursive-backtracker', { seed: mazeSeed });
createAndSolveMaze(15, 10, 'recursive-backtracker-biased', { seed: mazeSeed });
createAndSolveMaze(15, 10, 'prim', { seed: mazeSeed });
createAndSolveMaze(15, 10, 'kruskal', { seed: mazeSeed });
createAndSolveMaze(15, 10, 'wilson', { seed: mazeSeed });
createAndSolveMaze(15, 10, 'binary-tree', { seed: mazeSeed });
createAndSolveMaze(15, 10, 'growing-tree', { seed: mazeSeed, growingTreeStrategy: 'newest' });
createAndSolveMaze(15, 10, 'growing-tree', { seed: mazeSeed, growingTreeStrategy: 'random' });
createAndSolveMaze(15, 10, 'growing-tree', { seed: mazeSeed, growingTreeStrategy: 'oldest' });

console.log("\n--- 以下為無種子 (隨機) 的迷宮 ---");
createAndSolveMaze(15, 10, 'recursive-backtracker');

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maze_generator_1 = require("./maze-generator");
const maze_solver_1 = require("./maze-solver");
const maze_drawer_1 = require("./maze-drawer");
// --- 使用範例 ---
/**
 * 輔助函式：產生、設定出入口並印出迷宮
 * @param width 迷宮寬度
 * @param height 迷宮高度
 */
function createAndSolveMaze(width, height, algorithm, seed) {
    const algorithmName = algorithm.charAt(0).toUpperCase() + algorithm.slice(1).replace('-', ' ');
    console.log(`\n這是一個 ${width}x${height} 的迷宮 (使用 ${algorithmName} 演算法${seed !== undefined ? `，種子: ${seed}` : ''}，包含解答路徑)：`);
    const mazeGenerator = new maze_generator_1.MazeGenerator(width, height, algorithm, seed);
    const mazeData = mazeGenerator.generate();
    const start = { x: 0, y: 0 };
    const end = { x: width - 1, y: height - 1 };
    // 建立入口和出口
    mazeData[start.y][start.x].walls.top = false; // 入口
    mazeData[end.y][end.x].walls.bottom = false; // 出口
    // 解決迷宮
    const solver = new maze_solver_1.MazeSolver(mazeData);
    const path = solver.solve(start, end);
    (0, maze_drawer_1.drawMazeToConsole)(mazeData, path);
}
const mazeSeed = 12345;
createAndSolveMaze(15, 10, 'recursive-backtracker', mazeSeed);
createAndSolveMaze(15, 10, 'recursive-backtracker-biased', mazeSeed);
createAndSolveMaze(15, 10, 'prim', mazeSeed);
createAndSolveMaze(15, 10, 'kruskal', mazeSeed);
createAndSolveMaze(15, 10, 'wilson', mazeSeed);
createAndSolveMaze(15, 10, 'growing-tree', mazeSeed);
createAndSolveMaze(15, 10, 'binary-tree', mazeSeed);
console.log("\n--- 以下為無種子 (隨機) 的迷宮 ---");
createAndSolveMaze(15, 10, 'recursive-backtracker');

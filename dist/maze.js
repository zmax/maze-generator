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
async function createAndSolveMaze(width, height, algorithm, options) {
    const seed = options?.seed;
    const gtStrategyInfo = (algorithm === 'growing-tree' && options?.growingTreeStrategy) ? ` (${options.growingTreeStrategy})` : '';
    const rbBiasInfo = (algorithm === 'recursive-backtracker-biased' && options?.straightBias) ? ` (bias: ${options.straightBias})` : '';
    const btBiasInfo = (algorithm === 'binary-tree' && options?.binaryTreeBias) ? ` (${options.binaryTreeBias})` : '';
    const algorithmName = algorithm.charAt(0).toUpperCase() + algorithm.slice(1).replace(/-(\w)/g, (g) => g[1].toUpperCase());
    console.log(`\n這是一個 ${width}x${height} 的迷宮 (使用 ${algorithmName}${gtStrategyInfo}${rbBiasInfo}${btBiasInfo} 演算法${seed !== undefined ? `，種子: ${seed}` : ''}，包含解答路徑)：`);
    const mazeGenerator = new maze_generator_1.MazeGenerator(width, height, algorithm, options);
    const mazeData = await mazeGenerator.generate();
    const start = { x: 0, y: 0 };
    const end = { x: width - 1, y: height - 1 };
    // 建立入口和出口
    mazeData[start.y][start.x].walls.top = false; // 入口
    mazeData[end.y][end.x].walls.bottom = false; // 出口
    // 解決迷宮
    const solver = new maze_solver_1.MazeSolver(mazeData);
    const path = await solver.solve(start, end);
    (0, maze_drawer_1.drawMazeToConsole)(mazeData, path);
}
/**
 * 產生並逐步視覺化迷宮生成過程的範例函式。
 * @param width 迷宮寬度
 * @param height 迷宮高度
 * @param algorithm 要使用的演算法
 * @param seed 隨機種子
 */
async function createAndVisualizeMaze(width, height, algorithm, seed) {
    console.log(`\n--- 視覺化 ${algorithm} 演算法生成過程 (種子: ${seed}) ---`);
    // 一個簡單的、用於在主控台清除並重繪的視覺化回呼函式
    const onStepCallback = async (step) => {
        console.clear();
        console.log(`視覺化 ${algorithm} 生成中...`);
        // 建立一個臨時路徑來突顯演算法正在處理的儲存格
        const highlightPath = [];
        if (step.walkPath)
            highlightPath.push(...step.walkPath); // Wilson's
        if (step.stack)
            highlightPath.push(...step.stack); // Recursive Backtracker
        if (step.activeSet)
            highlightPath.push(...step.activeSet); // Prim's, Growing Tree
        if (step.currentCell)
            highlightPath.push(step.currentCell); // 突顯當前儲存格
        (0, maze_drawer_1.drawMazeToConsole)(step.grid, highlightPath);
        // 為了讓動畫可見，加入一個短暫的延遲
        await new Promise(resolve => setTimeout(resolve, 30));
    };
    const mazeGenerator = new maze_generator_1.MazeGenerator(width, height, algorithm, {
        seed,
        onStep: onStepCallback,
    });
    await mazeGenerator.generate();
    console.log(`\n${algorithm} 演算法生成完畢！`);
}
/**
 * 產生迷宮並逐步視覺化其求解過程的範例函式。
 * @param width 迷宮寬度
 * @param height 迷宮高度
 * @param algorithm 要使用的演算法
 * @param seed 隨機種子
 */
async function visualizeSolving(width, height, algorithm, seed) {
    console.log(`\n--- 視覺化求解過程 (演算法: ${algorithm}, 種子: ${seed}) ---`);
    // 1. 先靜態產生一個迷宮
    const mazeGenerator = new maze_generator_1.MazeGenerator(width, height, algorithm, { seed });
    const grid = await mazeGenerator.generate();
    const start = { x: 0, y: 0 };
    const end = { x: width - 1, y: height - 1 };
    grid[start.y][start.x].walls.top = false;
    grid[end.y][end.x].walls.bottom = false;
    // 2. 建立求解器的視覺化回呼函式
    const onSolveStep = async (step) => {
        console.clear();
        console.log(`視覺化求解中...`);
        (0, maze_drawer_1.drawMazeToConsole)(step.grid, {
            forwardOpen: new Set(step.openSetForward),
            forwardClosed: new Set(step.closedSetForward),
            backwardOpen: new Set(step.openSetBackward),
            backwardClosed: new Set(step.closedSetBackward),
        });
        await new Promise(resolve => setTimeout(resolve, 50));
    };
    // 3. 建立求解器並執行求解
    const solver = new maze_solver_1.MazeSolver(grid, { onStep: onSolveStep });
    const finalPath = await solver.solve(start, end);
    // 4. 顯示最終結果
    console.clear();
    console.log(`求解完畢！`);
    (0, maze_drawer_1.drawMazeToConsole)(grid, finalPath);
}
async function main() {
    // 執行視覺化範例
    await createAndVisualizeMaze(20, 10, 'recursive-backtracker', 123);
    await visualizeSolving(20, 10, 'kruskal', 456);
    // 執行原有的靜態生成範例
    const mazeSeed = 12345;
    await createAndSolveMaze(15, 10, 'recursive-backtracker', { seed: mazeSeed });
    await createAndSolveMaze(15, 10, 'recursive-backtracker-biased', { seed: mazeSeed, straightBias: 0.90 });
    await createAndSolveMaze(15, 10, 'prim', { seed: mazeSeed });
    await createAndSolveMaze(15, 10, 'growing-tree', { seed: mazeSeed, growingTreeStrategy: 'random' });
    await createAndSolveMaze(15, 10, 'binary-tree', { seed: mazeSeed, binaryTreeBias: 'south-east' });
    await createAndSolveMaze(15, 10, 'aldous-broder', { seed: mazeSeed });
}
main();

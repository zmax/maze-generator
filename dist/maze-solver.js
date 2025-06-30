"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MazeSolver = void 0;
const priority_queue_1 = require("./data-structures/priority-queue");
/**
 * 使用 A* (A-star) 演算法來解決迷宮
 */
class MazeSolver {
    grid;
    width;
    height;
    constructor(grid) {
        this.grid = grid;
        this.height = grid.length;
        this.width = this.height > 0 ? grid[0].length : 0;
    }
    /**
     * A* 演算法的啟發函式 (使用曼哈頓距離)
     */
    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
    solve(start, end) {
        const startCell = this.grid[start.y][start.x];
        const endCell = this.grid[end.y][end.x];
        // openSet: 使用優先權佇列來儲存待評估的節點，fScore 越低優先權越高。
        const openSet = new priority_queue_1.PriorityQueue();
        // closedSet: 儲存已經評估過的節點，避免重複處理。
        const closedSet = new Set();
        // cameFrom: 記錄每個節點在最短路徑上的前一個節點
        const cameFrom = new Map();
        // gScore: 記錄從起點到目前節點的已知最低成本
        const gScore = new Map();
        gScore.set(startCell, 0);
        // 我們直接將 fScore 作為優先權插入佇列
        const startFScore = this.heuristic(startCell, endCell);
        openSet.insert(startCell, startFScore);
        while (!openSet.isEmpty()) {
            // 從 openSet 中取出 fScore 最低的節點
            const currentCell = openSet.extractMin();
            // 如果我們已經處理過這個節點，就跳過。
            // 這是必要的，因為我們可能會將同一個節點以不同的 fScore 多次加入佇列。
            if (closedSet.has(currentCell)) {
                continue;
            }
            closedSet.add(currentCell);
            if (currentCell === endCell) {
                // 已到達終點，回溯路徑
                const path = [];
                let current = endCell;
                while (current) {
                    path.unshift(current);
                    current = cameFrom.get(current) || null;
                }
                return path;
            }
            const { x, y, walls } = currentCell;
            const traversableNeighbors = [];
            if (!walls.top && y > 0)
                traversableNeighbors.push(this.grid[y - 1][x]);
            if (!walls.right && x < this.width - 1)
                traversableNeighbors.push(this.grid[y][x + 1]);
            if (!walls.bottom && y < this.height - 1)
                traversableNeighbors.push(this.grid[y + 1][x]);
            if (!walls.left && x > 0)
                traversableNeighbors.push(this.grid[y][x - 1]);
            for (const neighbor of traversableNeighbors) {
                // tentativeGScore 是從起點經過 currentCell 到達 neighbor 的距離
                const tentativeGScore = (gScore.get(currentCell) ?? Infinity) + 1;
                if (tentativeGScore < (gScore.get(neighbor) ?? Infinity)) {
                    // 這條到達 neighbor 的路徑比之前任何路徑都好，記錄下來！
                    cameFrom.set(neighbor, currentCell);
                    gScore.set(neighbor, tentativeGScore);
                    const neighborFScore = tentativeGScore + this.heuristic(neighbor, endCell);
                    openSet.insert(neighbor, neighborFScore);
                }
            }
        }
        return []; // 找不到路徑
    }
}
exports.MazeSolver = MazeSolver;

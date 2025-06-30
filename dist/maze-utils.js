"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeWalls = removeWalls;
exports.getNeighbors = getNeighbors;
exports.getUnvisitedNeighbors = getUnvisitedNeighbors;
/**
 * 移除兩個相鄰儲存格之間的牆壁
 * @param a 第一個儲存格
 * @param b 第二個儲存格
 */
function removeWalls(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    // 處理水平方向的牆壁
    switch (dx) {
        case 1: // a 在 b 的右邊
            a.walls.left = false;
            b.walls.right = false;
            break;
        case -1: // a 在 b 的左邊
            a.walls.right = false;
            b.walls.left = false;
            break;
    }
    // 處理垂直方向的牆壁
    switch (dy) {
        case 1: // a 在 b 的下面
            a.walls.top = false;
            b.walls.bottom = false;
            break;
        case -1: // a 在 b 的上面
            a.walls.bottom = false;
            b.walls.top = false;
            break;
    }
}
/**
 * 獲取一個儲存格的所有物理上的鄰居，不論其是否已被訪問。
 * @param cell 要檢查的儲存格。
 * @param grid 整個迷宮的網格。
 * @param width 迷宮的寬度。
 * @param height 迷宮的高度。
 * @returns {Cell[]} 一個包含相鄰儲存格的陣列。
 */
function getNeighbors(cell, grid, width, height) {
    const neighbors = [];
    const { x, y } = cell;
    const directions = [
        { dx: 0, dy: -1 }, // 上
        { dx: 1, dy: 0 }, // 右
        { dx: 0, dy: 1 }, // 下
        { dx: -1, dy: 0 }, // 左
    ];
    for (const { dx, dy } of directions) {
        const newX = x + dx;
        const newY = y + dy;
        if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
            neighbors.push(grid[newY][newX]);
        }
    }
    return neighbors;
}
/**
 * 獲取指定儲存格的所有未訪問鄰居
 * @param cell 要檢查的儲存格
 * @param grid 整個迷宮的網格。
 * @param width 迷宮的寬度。
 * @param height 迷宮的高度。
 * @returns {Cell[]} 未訪問的鄰居陣列
 */
function getUnvisitedNeighbors(cell, grid, width, height) {
    return getNeighbors(cell, grid, width, height).filter(neighbor => !neighbor.visited);
}

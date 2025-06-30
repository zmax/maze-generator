import type { Cell } from './types';

/**
 * 移除兩個相鄰儲存格之間的牆壁
 * @param a 第一個儲存格
 * @param b 第二個儲存格
 */
export function removeWalls(a: Cell, b: Cell): void {
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
export function getNeighbors(cell: Cell, grid: Cell[][], width: number, height: number): Cell[] {
  const neighbors: Cell[] = [];
  const { x, y } = cell;
  const directions = [
    { dx: 0, dy: -1 }, // 上
    { dx: 1, dy: 0 },  // 右
    { dx: 0, dy: 1 },  // 下
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
export function getUnvisitedNeighbors(cell: Cell, grid: Cell[][], width: number, height: number): Cell[] {
  return getNeighbors(cell, grid, width, height).filter(neighbor => !neighbor.visited);
}

/**
 * 建立一個基於種子的偽隨機數生成器 (PRNG)。
 * 使用 Mulberry32 演算法，這是一個簡單且快速的 32 位元 PRNG。
 * @param seed 用於初始化生成器的數字種子。
 * @returns {() => number} 一個函式，每次呼叫時回傳一個 [0, 1) 之間的偽隨機數。
 */
export function createSeededRandom(seed: number): () => number {
  return function() {
    var t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
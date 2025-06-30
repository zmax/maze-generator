import type { Cell, Point } from './types';

/**
 * 一個使用最小堆實作的優先權佇列，用於 A* 演算法。
 * 優先權越低，越先被取出。
 */
class PriorityQueue<T> {
  private heap: { item: T; priority: number }[] = [];

  /**
   * 插入一個帶有優先權的項目
   * @param item 要插入的項目
   * @param priority 優先權 (數值越小越高)
   */
  public insert(item: T, priority: number): void {
    this.heap.push({ item, priority });
    this.siftUp(this.heap.length - 1);
  }

  /**
   * 取出並回傳優先權最高的項目 (最小的值)
   * @returns {T | null} 優先權最高的項目，如果佇列為空則回傳 null
   */
  public extractMin(): T | null {
    if (this.isEmpty()) {
      return null;
    }
    this.swap(0, this.heap.length - 1);
    const { item } = this.heap.pop()!;
    if (!this.isEmpty()) {
      this.siftDown(0);
    }
    return item;
  }

  /**
   * 檢查佇列是否為空
   * @returns {boolean} 如果為空則為 true
   */
  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private getParentIndex(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private getLeftChildIndex(i: number): number {
    return 2 * i + 1;
  }

  private getRightChildIndex(i: number): number {
    return 2 * i + 2;
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private siftUp(i: number): void {
    let parentIndex = this.getParentIndex(i);
    while (i > 0 && this.heap[i].priority < this.heap[parentIndex].priority) {
      this.swap(i, parentIndex);
      i = parentIndex;
      parentIndex = this.getParentIndex(i);
    }
  }

  private siftDown(i: number): void {
    let minIndex = i;
    const leftIndex = this.getLeftChildIndex(i);
    const rightIndex = this.getRightChildIndex(i);
    const size = this.heap.length;

    if (leftIndex < size && this.heap[leftIndex].priority < this.heap[minIndex].priority) {
      minIndex = leftIndex;
    }

    if (rightIndex < size && this.heap[rightIndex].priority < this.heap[minIndex].priority) {
      minIndex = rightIndex;
    }

    if (i !== minIndex) {
      this.swap(i, minIndex);
      this.siftDown(minIndex);
    }
  }
}

/**
 * 使用 A* (A-star) 演算法來解決迷宮
 */
export class MazeSolver {
  private grid: Cell[][];
  private width: number;
  private height: number;

  constructor(grid: Cell[][]) {
    this.grid = grid;
    this.height = grid.length;
    this.width = this.height > 0 ? grid[0].length : 0;
  }

  /**
   * A* 演算法的啟發函式 (使用曼哈頓距離)
   */
  private heuristic(a: Cell, b: Cell): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  public solve(start: Point, end: Point): Cell[] {
    const startCell = this.grid[start.y][start.x];
    const endCell = this.grid[end.y][end.x];

    // openSet: 使用優先權佇列來儲存待評估的節點，fScore 越低優先權越高。
    const openSet = new PriorityQueue<Cell>();

    // closedSet: 儲存已經評估過的節點，避免重複處理。
    const closedSet = new Set<Cell>();

    // cameFrom: 記錄每個節點在最短路徑上的前一個節點
    const cameFrom = new Map<Cell, Cell>();

    // gScore: 記錄從起點到目前節點的已知最低成本
    const gScore = new Map<Cell, number>();
    gScore.set(startCell, 0);

    // 我們直接將 fScore 作為優先權插入佇列
    const startFScore = this.heuristic(startCell, endCell);
    openSet.insert(startCell, startFScore);

    while (!openSet.isEmpty()) {
      // 從 openSet 中取出 fScore 最低的節點
      const currentCell = openSet.extractMin()!;

      // 如果我們已經處理過這個節點，就跳過。
      // 這是必要的，因為我們可能會將同一個節點以不同的 fScore 多次加入佇列。
      if (closedSet.has(currentCell)) {
        continue;
      }
      closedSet.add(currentCell);

      if (currentCell === endCell) {
        // 已到達終點，回溯路徑
        const path: Cell[] = [];
        let current: Cell | null = endCell;
        while (current) {
          path.unshift(current);
          current = cameFrom.get(current) || null;
        }
        return path;
      }

      const { x, y, walls } = currentCell;
      const traversableNeighbors: Cell[] = [];
      if (!walls.top && y > 0) traversableNeighbors.push(this.grid[y - 1][x]);
      if (!walls.right && x < this.width - 1) traversableNeighbors.push(this.grid[y][x + 1]);
      if (!walls.bottom && y < this.height - 1) traversableNeighbors.push(this.grid[y + 1][x]);
      if (!walls.left && x > 0) traversableNeighbors.push(this.grid[y][x - 1]);

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
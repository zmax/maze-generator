import type { Cell, Point } from './types';
import { PriorityQueue } from './data-structures/priority-queue';

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
    // 為了向後相容，保留舊的 solve 方法，但使其呼叫新的雙向版本
    return this.solveBidirectional(start, end);
  }

  /**
   * 使用「雙向 A* 演算法」來解決迷宮，效能更佳。
   * @param start 起點座標
   * @param end 終點座標
   * @returns {Cell[]} 從起點到終點的路徑，如果找不到則回傳空陣列。
   */
  public solveBidirectional(start: Point, end: Point): Cell[] {
    const startCell = this.grid[start.y][start.x];
    const endCell = this.grid[end.y][end.x];

    if (startCell === endCell) {
      return [startCell];
    }

    // --- 前向搜尋的資料結構 ---
    const openSetForward = new PriorityQueue<Cell>();
    const closedSetForward = new Set<Cell>();
    const cameFromForward = new Map<Cell, Cell>();
    const gScoreForward = new Map<Cell, number>();
    gScoreForward.set(startCell, 0);
    openSetForward.insert(startCell, this.heuristic(startCell, endCell));

    // --- 後向搜尋的資料結構 ---
    const openSetBackward = new PriorityQueue<Cell>();
    const closedSetBackward = new Set<Cell>();
    const cameFromBackward = new Map<Cell, Cell>();
    const gScoreBackward = new Map<Cell, number>();
    gScoreBackward.set(endCell, 0);
    openSetBackward.insert(endCell, this.heuristic(endCell, startCell));

    let meetingNode: Cell | null = null;

    while (!openSetForward.isEmpty() && !openSetBackward.isEmpty()) {
      // --- 前向搜尋步驟 ---
      const currentForward = openSetForward.extractMin()!;
      if (closedSetForward.has(currentForward)) continue;
      closedSetForward.add(currentForward);

      // 檢查是否與後向搜尋的已訪問集合相遇
      if (closedSetBackward.has(currentForward)) {
        meetingNode = currentForward;
        break;
      }

      this._expandNeighbors(currentForward, endCell, gScoreForward, cameFromForward, openSetForward);

      // --- 後向搜尋步驟 ---
      const currentBackward = openSetBackward.extractMin()!;
      if (closedSetBackward.has(currentBackward)) continue;
      closedSetBackward.add(currentBackward);

      // 檢查是否與前向搜尋的已訪問集合相遇
      if (closedSetForward.has(currentBackward)) {
        meetingNode = currentBackward;
        break;
      }

      this._expandNeighbors(currentBackward, startCell, gScoreBackward, cameFromBackward, openSetBackward);
    }

    if (meetingNode) {
      const pathForward = this._reconstructPath(cameFromForward, meetingNode);
      const pathBackward = this._reconstructPath(cameFromBackward, meetingNode);
      pathBackward.reverse();
      return pathForward.concat(pathBackward.slice(1));
    }

    return []; // 找不到路徑
  }

  /**
   * 擴展一個節點的鄰居，計算分數並將其加入 openSet。
   * @private
   */
  private _expandNeighbors(currentCell: Cell, goalCell: Cell, gScore: Map<Cell, number>, cameFrom: Map<Cell, Cell>, openSet: PriorityQueue<Cell>) {
    const { x, y, walls } = currentCell;
    const traversableNeighbors: Cell[] = [];
    if (!walls.top && y > 0) traversableNeighbors.push(this.grid[y - 1][x]);
    if (!walls.right && x < this.width - 1) traversableNeighbors.push(this.grid[y][x + 1]);
    if (!walls.bottom && y < this.height - 1) traversableNeighbors.push(this.grid[y + 1][x]);
    if (!walls.left && x > 0) traversableNeighbors.push(this.grid[y][x - 1]);

    for (const neighbor of traversableNeighbors) {
      const tentativeGScore = (gScore.get(currentCell) ?? Infinity) + 1;
      if (tentativeGScore < (gScore.get(neighbor) ?? Infinity)) {
        cameFrom.set(neighbor, currentCell);
        gScore.set(neighbor, tentativeGScore);
        const fScore = tentativeGScore + this.heuristic(neighbor, goalCell);
        openSet.insert(neighbor, fScore);
      }
    }
  }

  /**
   * 從 cameFrom 映射中回溯並建構路徑。
   * @private
   */
  private _reconstructPath(cameFrom: Map<Cell, Cell>, current: Cell): Cell[] {
    const path: Cell[] = [current];
    let temp: Cell | undefined = current;
    while ((temp = cameFrom.get(temp!))) {
      path.unshift(temp);
    }
    return path;
  }
}
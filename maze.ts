/**
 * 代表迷宮中的一個儲存格 (Cell)
 */
interface Cell {
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
 * 使用遞迴回溯演算法產生迷宮
 */
export class MazeGenerator {
  public readonly width: number;
  public readonly height: number;
  public grid: Cell[][] = [];
  private stack: Cell[] = [];

  /**
   * @param width 迷宮的寬度（儲存格數量）
   * @param height 迷宮的高度（儲存格數量）
   */
  constructor(width: number, height: number) {
    if (width <= 0 || height <= 0) {
      throw new Error("Width and height must be greater than 0.");
    }
    this.width = width;
    this.height = height;
  }

  /**
   * 產生迷宮的主要方法
   * @returns {Cell[][]} 代表迷宮的二維陣列
   */
  public generate(): Cell[][] {
    this.initializeGrid();

    // 1. 選擇一個起始儲存格
    const startCell = this.grid[0][0];
    startCell.visited = true;
    this.stack.push(startCell);

    // 2. 當堆疊不為空時，持續處理
    while (this.stack.length > 0) {
      // 查看堆疊頂端的儲存格，但不將其彈出
      const currentCell = this.stack[this.stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(currentCell);

      // 3. 如果有未訪問的鄰居
      if (neighbors.length > 0) {
        // 隨機選擇一個鄰居
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        // 打通牆壁
        this.removeWalls(currentCell, randomNeighbor);
        // 將鄰居標記為已訪問並推入堆疊
        randomNeighbor.visited = true;
        this.stack.push(randomNeighbor);
      } else {
        // 如果沒有未訪問的鄰居，則從堆疊中彈出儲存格（回溯）
        this.stack.pop();
      }
    }
    
    return this.grid;
  }

  /**
   * 初始化網格，建立所有儲存格並設定所有牆壁
   */
  private initializeGrid(): void {
    this.stack = [];
    this.grid = Array.from({ length: this.height }, (_, y) =>
      Array.from({ length: this.width }, (_, x) => ({
        x,
        y,
        walls: { top: true, right: true, bottom: true, left: true },
        visited: false,
      }))
    );
  }

  /**
   * 獲取指定儲存格的所有未訪問鄰居
   * @param cell 要檢查的儲存格
   * @returns {Cell[]} 未訪問的鄰居陣列
   */
  private getUnvisitedNeighbors(cell: Cell): Cell[] {
    const neighbors: Cell[] = [];
    const { x, y } = cell;

    // 定義四個方向的移動向量
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 1, dy: 0 },  // 右
      { dx: 0, dy: 1 },  // 下
      { dx: -1, dy: 0 }, // 左
    ];

    for (const { dx, dy } of directions) {
      const newX = x + dx;
      const newY = y + dy;

      // 檢查鄰居是否在邊界內且未被訪問
      if (newX >= 0 && newX < this.width && newY >= 0 && newY < this.height && !this.grid[newY][newX].visited) {
        neighbors.push(this.grid[newY][newX]);
      }
    }

    return neighbors;
  }

  /**
   * 移除兩個相鄰儲存格之間的牆壁
   * @param a 第一個儲存格
   * @param b 第二個儲存格
   */
  private removeWalls(a: Cell, b: Cell): void {
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
}

/**
 * 使用廣度優先搜尋 (BFS) 解決迷宮
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

  public solve(start: { x: number; y: number }, end: { x: number; y: number }): Cell[] {
    const queue: Cell[] = [];
    const parentMap = new Map<Cell, Cell | null>();
    const visited = new Set<Cell>();

    const startCell = this.grid[start.y][start.x];
    const endCell = this.grid[end.y][end.x];

    queue.push(startCell);
    visited.add(startCell);
    parentMap.set(startCell, null);

    while (queue.length > 0) {
      const currentCell = queue.shift()!;
      if (currentCell === endCell) {
        const path: Cell[] = [];
        let current: Cell | null = endCell;
        while (current) {
          path.unshift(current);
          current = parentMap.get(current) || null;
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
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parentMap.set(neighbor, currentCell);
          queue.push(neighbor);
        }
      }
    }
    return []; // No path found
  }
}

/**
 * 將迷宮資料結構繪製到主控台
 * @param grid 迷宮的二維陣列
 * @param path (可選) 要繪製的路徑，儲存格陣列
 */
export function drawMazeToConsole(grid: Cell[][], path: Cell[] = []): void {
  const height = grid.length;
  if (height === 0) return;
  const width = grid[0].length;
  if (width === 0) return;
 
  const outputLines: string[] = [];

  const pathSet = new Set(path);
  // 繪製頂部邊界
  let topBorder = '+';
  for (let x = 0; x < width; x++) {
    topBorder += (grid[0][x].walls.top ? '---' : '   ') + '+';
  }
  outputLines.push(topBorder);

  // 繪製每一行
  for (let y = 0; y < height; y++) {
    // 繪製儲存格內部和右牆
    let rowStr = grid[y][0].walls.left ? '|' : ' '; // 左邊界
    for (let x = 0; x < width; x++) {
      const cell = grid[y][x];
      const cellContent = pathSet.has(cell) ? ' . ' : '   ';
      rowStr += cellContent; // 儲存格內部空間
      rowStr += grid[y][x].walls.right ? '|' : ' ';
    }
    outputLines.push(rowStr);

    // 繪製下牆
    let bottomStr = '+';
    for (let x = 0; x < width; x++) {
      bottomStr += (grid[y][x].walls.bottom ? '---' : '   ') + '+';
    }
    outputLines.push(bottomStr);
  }

  console.log(outputLines.join('\n'));
}

// --- 使用範例 ---

/**
 * 輔助函式：產生、設定出入口並印出迷宮
 * @param width 迷宮寬度
 * @param height 迷宮高度
 */
function createSolveAndPrintMaze(width: number, height: number): void {
  console.log(`\n這是一個 ${width}x${height} 的迷宮 (包含解答路徑)：`);
  const mazeGenerator = new MazeGenerator(width, height);
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

createSolveAndPrintMaze(15, 10);
createSolveAndPrintMaze(5, 5);

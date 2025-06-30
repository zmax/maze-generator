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

export type MazeGenerationAlgorithm = 'recursive-backtracker' | 'recursive-backtracker-biased' | "prim" | "kruskal";

/**
 * A class to generate mazes using various algorithms.
 */
export class MazeGenerator {
  public readonly width: number;
  public readonly height: number;
  public grid: Cell[][] = [];
  private stack: Cell[] = [];
  private algorithm: MazeGenerationAlgorithm;

  /**
   * @param width 迷宮的寬度（儲存格數量）
   * @param height 迷宮的高度（儲存格數量）
   */
  constructor(width: number, height: number, algorithm: MazeGenerationAlgorithm = 'recursive-backtracker') {
    if (width <= 0 || height <= 0) {
      throw new Error("Width and height must be greater than 0.");
    }
    this.width = width;
    this.height = height;
    this.algorithm = algorithm;
  }

  /**
   * 產生迷宮的主要方法
   * @returns {Cell[][]} 代表迷宮的二維陣列
   */
  public generate(): Cell[][] {
    this.initializeGrid();
    switch (this.algorithm) {
      case 'prim':
        return this.generateWithPrim();
      case 'kruskal':
        return this.generateWithKruskal();
      case 'recursive-backtracker':
      case 'recursive-backtracker-biased':
      default:
        return this.generateWithRecursiveBacktracker();
    }
  }

  /**
   * Generates a maze using the Recursive Backtracking algorithm.
   * @returns {Cell[][]} The generated maze grid.
   */
  private generateWithRecursiveBacktracker(): Cell[][] {
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
        let nextCell: Cell;
        if (this.algorithm === 'recursive-backtracker-biased') {
          const previousCell = this.stack.length > 1 ? this.stack[this.stack.length - 2] : null;
          let straightNeighbor: Cell | undefined = undefined;

          if (previousCell) {
            const lastMoveDx = currentCell.x - previousCell.x;
            const lastMoveDy = currentCell.y - previousCell.y;
            straightNeighbor = neighbors.find(n => n.x - currentCell.x === lastMoveDx && n.y - currentCell.y === lastMoveDy);
          }

          // 75% chance to continue straight, otherwise pick a random neighbor
          const bias = 0.75;
          if (straightNeighbor && Math.random() < bias) {
            nextCell = straightNeighbor;
          } else {
            nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
          }
        } else {
          // Original random selection
          nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
        }
        // 打通牆壁
        this.removeWalls(currentCell, nextCell);
        // 將鄰居標記為已訪問並推入堆疊
        nextCell.visited = true;
        this.stack.push(nextCell);
      } else {
        // 如果沒有未訪問的鄰居，則從堆疊中彈出儲存格（回溯）
        this.stack.pop();
      }
    }
    
    return this.grid;
  }

  /**
   * Generates a maze using Prim's algorithm.
   * @returns {Cell[][]} The generated maze grid.
   */
  private generateWithPrim(): Cell[][] {
    // 1. Pick a starting cell and mark it as part of the maze.
    const startCell = this.grid[Math.floor(Math.random() * this.height)][Math.floor(Math.random() * this.width)];
    startCell.visited = true;

    // 2. Create a list of walls connected to the maze (the frontier).
    const frontier: { from: Cell, to: Cell }[] = [];
    const addFrontier = (cell: Cell) => {
      const { x, y } = cell;
      if (y > 0) frontier.push({ from: cell, to: this.grid[y - 1][x] });
      if (x < this.width - 1) frontier.push({ from: cell, to: this.grid[y][x + 1] });
      if (y < this.height - 1) frontier.push({ from: cell, to: this.grid[y + 1][x] });
      if (x > 0) frontier.push({ from: cell, to: this.grid[y][x - 1] });
    };
    addFrontier(startCell);

    // 3. While the frontier is not empty
    while (frontier.length > 0) {
      // Pick a random wall from the frontier
      const randIndex = Math.floor(Math.random() * frontier.length);
      const { from, to } = frontier.splice(randIndex, 1)[0];

      // If the cell on the other side is not yet part of the maze
      if (!to.visited) {
        // Carve a passage
        this.removeWalls(from, to);
        // Mark the new cell as part of the maze
        to.visited = true;
        // Add the new cell's walls to the frontier
        addFrontier(to);
      }
    }
    return this.grid;
  }

  /**
   * Generates a maze using Kruskal's algorithm.
   * @returns {Cell[][]} The generated maze grid.
   */
  private generateWithKruskal(): Cell[][] {
    // 1. Create a list of all interior walls
    const walls: { c1: Cell, c2: Cell }[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (y < this.height - 1) walls.push({ c1: this.grid[y][x], c2: this.grid[y + 1][x] });
        if (x < this.width - 1) walls.push({ c1: this.grid[y][x], c2: this.grid[y][x + 1] });
      }
    }

    // 2. Shuffle the list of walls
    for (let i = walls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [walls[i], walls[j]] = [walls[j], walls[i]];
    }

    // 3. DSU (Disjoint Set Union) setup
    const parent = new Map<Cell, Cell>();
    const find = (cell: Cell): Cell => {
      if (parent.get(cell) === cell) return cell;
      const root = find(parent.get(cell)!);
      parent.set(cell, root); // Path compression
      return root;
    };
    this.grid.flat().forEach(cell => parent.set(cell, cell));

    // 4. Iterate through walls and connect sets
    for (const wall of walls) {
      const { c1, c2 } = wall;
      if (find(c1) !== find(c2)) {
        parent.set(find(c1), find(c2)); // Union
        this.removeWalls(c1, c2);
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

  /**
   * Heuristic function (Manhattan distance) for A*
   */
  private heuristic(a: Cell, b: Cell): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  public solve(start: { x: number; y: number }, end: { x: number; y: number }): Cell[] {
    const startCell = this.grid[start.y][start.x];
    const endCell = this.grid[end.y][end.x];

    // The set of nodes to be evaluated
    const openSet: Cell[] = [startCell];

    // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from start to n currently known.
    const cameFrom = new Map<Cell, Cell>();

    // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
    const gScore = new Map<Cell, number>();
    gScore.set(startCell, 0);

    // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
    // how short a path from start to finish can be if it goes through n.
    const fScore = new Map<Cell, number>();
    fScore.set(startCell, this.heuristic(startCell, endCell));

    while (openSet.length > 0) {
      // Find the node in openSet having the lowest fScore[] value
      let currentCell = openSet[0];
      for (let i = 1; i < openSet.length; i++) {
        if ((fScore.get(openSet[i]) ?? Infinity) < (fScore.get(currentCell) ?? Infinity)) {
          currentCell = openSet[i];
        }
      }

      if (currentCell === endCell) {
        // Reconstruct path
        const path: Cell[] = [];
        let current: Cell | null = endCell;
        while (current) {
          path.unshift(current);
          current = cameFrom.get(current) || null;
        }
        return path;
      }

      // Remove currentCell from openSet
      const index = openSet.indexOf(currentCell);
      openSet.splice(index, 1);

      const { x, y, walls } = currentCell;
      const traversableNeighbors: Cell[] = [];
      if (!walls.top && y > 0) traversableNeighbors.push(this.grid[y - 1][x]);
      if (!walls.right && x < this.width - 1) traversableNeighbors.push(this.grid[y][x + 1]);
      if (!walls.bottom && y < this.height - 1) traversableNeighbors.push(this.grid[y + 1][x]);
      if (!walls.left && x > 0) traversableNeighbors.push(this.grid[y][x - 1]);

      for (const neighbor of traversableNeighbors) {
        // tentative_gScore is the distance from start to the neighbor through current
        const tentativeGScore = (gScore.get(currentCell) ?? Infinity) + 1;
        if (tentativeGScore < (gScore.get(neighbor) ?? Infinity)) {
          // This path to neighbor is better than any previous one. Record it!
          cameFrom.set(neighbor, currentCell);
          gScore.set(neighbor, tentativeGScore);
          fScore.set(neighbor, tentativeGScore + this.heuristic(neighbor, endCell));
          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor);
          }
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
function createSolveAndPrintMaze(width: number, height: number, algorithm: MazeGenerationAlgorithm): void {
  const algorithmName = algorithm.charAt(0).toUpperCase() + algorithm.slice(1).replace('-', ' ');
  console.log(`\n這是一個 ${width}x${height} 的迷宮 (使用 ${algorithmName} 演算法，包含解答路徑)：`);
  const mazeGenerator = new MazeGenerator(width, height, algorithm);
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

createSolveAndPrintMaze(15, 10, 'recursive-backtracker');
createSolveAndPrintMaze(15, 10, 'recursive-backtracker-biased');
createSolveAndPrintMaze(15, 10, 'prim');
createSolveAndPrintMaze(15, 10, 'kruskal');

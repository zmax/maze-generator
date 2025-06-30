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
    
    // 建立入口和出口
    this.grid[0][0].walls.top = false;
    this.grid[this.height - 1][this.width - 1].walls.bottom = false;

    return this.grid;
  }

  /**
   * 初始化網格，建立所有儲存格並設定所有牆壁
   */
  private initializeGrid(): void {
    this.grid = [];
    this.stack = [];
    for (let y = 0; y < this.height; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < this.width; x++) {
        row.push({
          x,
          y,
          walls: { top: true, right: true, bottom: true, left: true },
          visited: false,
        });
      }
      this.grid.push(row);
    }
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
 * 將迷宮資料結構繪製到主控台
 * @param grid 迷宮的二維陣列
 */
export function drawMazeToConsole(grid: Cell[][]): void {
  const height = grid.length;
  if (height === 0) return;
  const width = grid[0].length;
  if (width === 0) return;
 
  const outputLines: string[] = [];

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
      rowStr += '   '; // 儲存格內部空間
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
// 建立一個 15x10 的迷宮產生器
const mazeGenerator = new MazeGenerator(15, 10);

// 產生迷宮資料
const mazeData = mazeGenerator.generate();

// 在主控台印出迷宮
console.log("這是一個 15x10 的迷宮：");
drawMazeToConsole(mazeData);

// 建立一個 5x5 的小迷宮
const smallMazeGenerator = new MazeGenerator(5, 5);
const smallMazeData = smallMazeGenerator.generate();
console.log("\n這是一個 5x5 的迷宮：");
drawMazeToConsole(smallMazeData);

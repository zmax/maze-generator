import type { Cell, MazeGenerationAlgorithm, MazeGeneratorOptions } from './types';
import { createSeededRandom, getNeighbors, getUnvisitedNeighbors, removeWalls } from './maze-utils';
import { DisjointSet } from './data-structures/disjoint-set';

/**
 * 一個使用多種演算法來產生迷宮的類別。
 */
export class MazeGenerator {
  public readonly width: number;
  public readonly height: number;
  public grid: Cell[][] = [];
  private stack: Cell[] = [];
  private algorithm: MazeGenerationAlgorithm;
  private random: () => number;
  private options: MazeGeneratorOptions;

  /**
   * @param width 迷宮的寬度（儲存格數量）
   * @param height 迷宮的高度（儲存格數量）
   * @param algorithm 要使用的生成演算法
   * @param options (可選) 包含演算法特定設定和隨機種子的物件。
   */
  constructor(width: number, height: number, algorithm: MazeGenerationAlgorithm = 'recursive-backtracker', options: MazeGeneratorOptions = {}) {
    if (width <= 0 || height <= 0) {
      throw new Error("Width and height must be greater than 0.");
    }
    this.width = width;
    this.height = height;
    this.algorithm = algorithm;
    this.options = {
      // 為 growing-tree 設定預設策略
      growingTreeStrategy: 'random',
      // 為 recursive-backtracker-biased 設定預設偏好值
      straightBias: 0.75,
      // 為 binary-tree 設定預設偏好方向
      binaryTreeBias: 'north-west',
      ...options,
    };

    // 驗證選項的有效性
    if (typeof this.options.straightBias === 'number' && (this.options.straightBias < 0 || this.options.straightBias > 1)) {
      throw new Error("straightBias option must be between 0.0 and 1.0.");
    }

    // 如果提供了種子，則建立一個可預測的隨機數生成器。否則，使用內建的 Math.random。
    if (typeof this.options.seed === 'number') {
      this.random = createSeededRandom(this.options.seed);
    } else {
      this.random = Math.random;
    }
  }

  /**
   * 產生迷宮的主要方法
   * @returns {Cell[][]} 代表迷宮的二維陣列
   * @async
   */
  public async generate(): Promise<Cell[][]> {
    this.initializeGrid();
    switch (this.algorithm) {
      case 'prim':
        return await this.generateWithPrim();
      case 'kruskal':
        return await this.generateWithKruskal();
      case 'wilson':
        return await this.generateWithWilson();
      case 'growing-tree':
        return await this.generateWithGrowingTree();
      case 'binary-tree':
        return await this.generateWithBinaryTree();
      case 'aldous-broder':
        return await this.generateWithAldousBroder();
      case 'sidewinder':
        return await this.generateWithSidewinder();
      case 'recursive-backtracker':
      case 'recursive-backtracker-biased':
      default:
        return await this.generateWithRecursiveBacktracker();
    }
  }

  /**
   * 使用「遞迴回溯」演算法產生迷宮。
   * @returns {Cell[][]} 產生的迷宮網格。
   * @async
   */
  private async generateWithRecursiveBacktracker(): Promise<Cell[][]> {
    // 1. 選擇一個起始儲存格
    const startCell = this.grid[0][0];
    startCell.visited = true;
    this.stack.push(startCell);
    const onStep = this.options.onStep;

    // 2. 當堆疊不為空時，持續處理
    while (this.stack.length > 0) {
      // 查看堆疊頂端的儲存格，但不將其彈出
      const currentCell = this.stack[this.stack.length - 1];
      const neighbors = getUnvisitedNeighbors(currentCell, this.grid, this.width, this.height);

      if (onStep) {
        await onStep({ grid: this.grid, stack: [...this.stack], currentCell });
      }

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

          // 根據設定的偏好值決定是否繼續直線前進
          const bias = this.options.straightBias!;
          if (straightNeighbor && this.random() < bias) {
            nextCell = straightNeighbor;
          } else {
            nextCell = neighbors[Math.floor(this.random() * neighbors.length)]; // 隨機選擇
          }
        } else {
          // Original random selection
          nextCell = neighbors[Math.floor(this.random() * neighbors.length)];
        }
        // 打通牆壁
        removeWalls(currentCell, nextCell);
        // 將鄰居標記為已訪問並推入堆疊
        nextCell.visited = true;
        this.stack.push(nextCell);
      } else {
        // 如果沒有未訪問的鄰居，則從堆疊中彈出儲存格（回溯）
        this.stack.pop();
        if (onStep) {
          await onStep({ grid: this.grid, stack: [...this.stack] });
        }
      }
    }
    
    return this.grid;
  }

  /**
   * 使用「普林演算法」(Prim's algorithm) 產生迷宮。
   * @returns {Cell[][]} 產生的迷宮網格。
   * @async
   */
  private async generateWithPrim(): Promise<Cell[][]> {
    // 1. 選擇一個起始儲存格，並將其標記為迷宮的一部分。
    const startCell = this.grid[Math.floor(this.random() * this.height)][Math.floor(this.random() * this.width)];
    startCell.visited = true;

    // 2. 建立一個與迷宮相連的牆壁列表（稱為「邊界」）。
    const onStep = this.options.onStep;
    const frontier: { from: Cell, to: Cell }[] = [];
    const addFrontier = (cell: Cell) => {
      const { x, y } = cell;
      if (y > 0) frontier.push({ from: cell, to: this.grid[y - 1][x] }); // 上
      if (x < this.width - 1) frontier.push({ from: cell, to: this.grid[y][x + 1] }); // 右
      if (y < this.height - 1) frontier.push({ from: cell, to: this.grid[y + 1][x] }); // 下
      if (x > 0) frontier.push({ from: cell, to: this.grid[y][x - 1] }); // 左
    };
    addFrontier(startCell);

    // 3. 當邊界列表不為空時
    while (frontier.length > 0) {
      // Pick a random wall from the frontier
      const randIndex = Math.floor(this.random() * frontier.length);
      const { from, to } = frontier.splice(randIndex, 1)[0];

      // If the cell on the other side is not yet part of the maze
      if (!to.visited) {
        if (onStep) {
          await onStep({ grid: this.grid, currentCell: to, activeSet: [from] });
        }

        // 打通牆壁，建立通道
        removeWalls(from, to);
        // 將新的儲存格標記為迷宮的一部分
        to.visited = true;
        // 將新儲存格的牆壁加入到邊界列表中
        addFrontier(to);
      }
    }
    return this.grid;
  }

  /**
   * 使用「克魯斯克爾演算法」(Kruskal's algorithm) 產生迷宮。
   * @returns {Cell[][]} 產生的迷宮網格。
   * @async
   */
  private async generateWithKruskal(): Promise<Cell[][]> {
    // 1. 建立一個包含所有內部牆壁的列表
    const walls: { c1: Cell, c2: Cell }[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (y < this.height - 1) walls.push({ c1: this.grid[y][x], c2: this.grid[y + 1][x] });
        if (x < this.width - 1) walls.push({ c1: this.grid[y][x], c2: this.grid[y][x + 1] });
      }
    }

    // 2. 將牆壁列表隨機排序
    for (let i = walls.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [walls[i], walls[j]] = [walls[j], walls[i]];
    }

    // 3. 初始化並查集，將每個儲存格視為一個獨立的集合
    const dsu = new DisjointSet(this.grid.flat());
    const onStep = this.options.onStep;

    // 4. 遍歷所有牆壁，如果牆壁兩側的儲存格不屬於同一個集合，則打通牆壁並合併集合
    for (const wall of walls) {
      const { c1, c2 } = wall;
      if (!dsu.connected(c1, c2)) {
        dsu.union(c1, c2);
        removeWalls(c1, c2);
        if (onStep) {
          await onStep({ grid: this.grid, activeSet: [c1, c2] });
        }
      }
    }

    return this.grid;
  }

  /**
   * 使用「威爾遜演算法」(Wilson's algorithm) 產生迷宮。
   * @returns {Cell[][]} 產生的迷宮網格。
   * @async
   */
  private async generateWithWilson(): Promise<Cell[][]> {
    // 1. 隨機選擇一個儲存格並將其標記為迷宮的一部分。
    const initialCell = this.grid[Math.floor(this.random() * this.height)][Math.floor(this.random() * this.width)];
    initialCell.visited = true;

    const onStep = this.options.onStep;
    // 2. 建立一個包含所有未訪問儲存格的列表，並隨機排序以作為隨機遊走的起點。
    const unvisited = this.grid.flat().filter(c => !c.visited);
    for (let i = unvisited.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [unvisited[i], unvisited[j]] = [unvisited[j], unvisited[i]];
    }

    for (const startCell of unvisited) {
      // 如果此儲存格已被先前的遊走訪問過，則跳過。
      if (startCell.visited) continue;

      let walkPath = [startCell];
      let current = startCell;

      // 3. 進行「抹除迴圈的隨機遊走」，直到碰到一個已在迷宮中的儲存格。
      while (!current.visited) {
        const neighbors = getNeighbors(current, this.grid, this.width, this.height);
        const next = neighbors[Math.floor(this.random() * neighbors.length)];

        const existingIndex = walkPath.indexOf(next);
        if (existingIndex !== -1) {
          // 偵測到迴圈！透過切割路徑來抹除它。
          walkPath = walkPath.slice(0, existingIndex + 1);
        } else {
          walkPath.push(next);
        }
        current = next;

        if (onStep) {
          await onStep({ grid: this.grid, walkPath: [...walkPath], currentCell: current });
        }
      }

      // 4. 將完成的遊走路徑刻入迷宮中。
      for (let i = 0; i < walkPath.length - 1; i++) {
        removeWalls(walkPath[i], walkPath[i + 1]);
        // Mark cells as visited now, so future walks can find the maze.
        walkPath[i].visited = true;
        if (onStep) {
          await onStep({ grid: this.grid, activeSet: [walkPath[i], walkPath[i+1]] });
        }
      }
    }

    return this.grid;
  }

  /**
   * 使用「生長樹演算法」(Growing Tree algorithm) 產生迷宮。
   * 這個演算法是遞迴回溯法和普林演算法的綜合體。
   * @returns {Cell[][]} 產生的迷宮網格。
   * @async
   */
  private async generateWithGrowingTree(): Promise<Cell[][]> {
    // 1. 建立一個作用中儲存格的列表
    const activeSet: Cell[] = [];

    // 2. 選擇一個隨機的起始儲存格，將其標記為已訪問，並加入作用中列表
    const startCell = this.grid[Math.floor(this.random() * this.height)][Math.floor(this.random() * this.width)];
    startCell.visited = true;
    activeSet.push(startCell);
    const onStep = this.options.onStep;

    // 3. 當作用中列表不為空時
    while (activeSet.length > 0) {
      // 3a. 從作用中列表中選擇一個儲存格。
      // 不同的選擇策略會產生不同風格的迷宮：
      // - 'newest': activeSet[activeSet.length - 1] (類似遞迴回溯)
      // - 'random': 隨機選擇 (類似 Prim's)
      // - 'oldest': activeSet[0] (產生長廊)
      const strategy = this.options.growingTreeStrategy;
      let index: number;

      switch (strategy) {
        case 'newest':
          index = activeSet.length - 1;
          break;
        case 'oldest':
          index = 0;
          break;
        case 'random':
        default:
          index = Math.floor(this.random() * activeSet.length);
          break;
      }
      const currentCell = activeSet[index];

      // 3b. 尋找該儲存格的未訪問鄰居
      const neighbors = getUnvisitedNeighbors(currentCell, this.grid, this.width, this.height);

      if (onStep) {
        await onStep({ grid: this.grid, activeSet: [...activeSet], currentCell });
      }

      if (neighbors.length > 0) {
        // 3c. 如果有未訪問的鄰居，隨機選擇一個
        const nextCell = neighbors[Math.floor(this.random() * neighbors.length)];
        removeWalls(currentCell, nextCell);
        nextCell.visited = true;
        activeSet.push(nextCell); // 將新儲存格加入作用中列表
      } else {
        // 3d. 如果沒有未訪問的鄰居，將目前儲存格從作用中列表移除
        activeSet.splice(index, 1);
      }
    }

    return this.grid;
  }

  /**
   * 使用「二元樹演算法」(Binary Tree algorithm) 產生迷宮。
   * 這是最簡單的演算法之一，速度極快，但會產生有強烈對角線偏向的迷宮。
   * @returns {Cell[][]} 產生的迷宮網格。
   * @async
   */
  private async generateWithBinaryTree(): Promise<Cell[][]> {
    const bias = this.options.binaryTreeBias!;
    const hasNorth = bias.includes('north');
    const hasSouth = bias.includes('south');
    const hasWest = bias.includes('west');
    const hasEast = bias.includes('east');
    const onStep = this.options.onStep;
    for (const row of this.grid) {
      for (const cell of row) {
        const neighborsToCarve: Cell[] = [];

        if (hasNorth && cell.y > 0) {
          neighborsToCarve.push(this.grid[cell.y - 1][cell.x]);
        }
        if (hasSouth && cell.y < this.height - 1) {
          neighborsToCarve.push(this.grid[cell.y + 1][cell.x]);
        }
        if (hasWest && cell.x > 0) {
          neighborsToCarve.push(this.grid[cell.y][cell.x - 1]);
        }
        if (hasEast && cell.x < this.width - 1) {
          neighborsToCarve.push(this.grid[cell.y][cell.x + 1]);
        }

        // 從可能的鄰居中隨機選擇一個來打通牆壁
        if (neighborsToCarve.length > 0) {
          const neighbor = neighborsToCarve[Math.floor(this.random() * neighborsToCarve.length)];
          removeWalls(cell, neighbor);
          if (onStep) {
            await onStep({ grid: this.grid, currentCell: cell, activeSet: [neighbor] });
          }
        }
      }
    }
    return this.grid;
  }

  /**
   * 使用「Aldous-Broder 演算法」產生迷宮。
   * 這是一種透過純粹的隨機遊走來產生均勻生成樹的演算法。
   * @returns {Cell[][]} 產生的迷宮網格。
   * @async
   */
  private async generateWithAldousBroder(): Promise<Cell[][]> {
    // 1. 選擇一個隨機的起始儲存格
    let currentCell = this.grid[Math.floor(this.random() * this.height)][Math.floor(this.random() * this.width)];
    currentCell.visited = true;

    // 2. 初始化未訪問儲存格的計數
    let unvisitedCount = this.width * this.height - 1;
    const onStep = this.options.onStep;
    // 3. 當還有未訪問的儲存格時，持續進行隨機遊走
    while (unvisitedCount > 0) {
      // 3a. 隨機選擇一個鄰居
      const neighbors = getNeighbors(currentCell, this.grid, this.width, this.height);
      const nextCell = neighbors[Math.floor(this.random() * neighbors.length)];

      // 3b. 如果鄰居未被訪問過
      if (!nextCell.visited) {
        removeWalls(currentCell, nextCell);
        nextCell.visited = true;
        unvisitedCount--;
      }

      // 3c. 移動到下一個儲存格，不論它是否已被訪問
      currentCell = nextCell;

      if (onStep) {
        await onStep({ grid: this.grid, currentCell });
      }
    }

    return this.grid;
  }

  /**
   * 使用「響尾蛇演算法」(Sidewinder algorithm) 產生迷宮。
   * 這是一種逐行處理的快速演算法，會產生強烈的水平紋理。
   * @returns {Cell[][]} 產生的迷宮網格。
   * @async
   */
  private async generateWithSidewinder(): Promise<Cell[][]> {
    const onStep = this.options.onStep;

    // 逐行處理
    for (let y = 0; y < this.height; y++) {
      let currentRun: Cell[] = [];
      for (let x = 0; x < this.width; x++) {
        const currentCell = this.grid[y][x];
        currentRun.push(currentCell);

        const atEastBoundary = (x === this.width - 1);
        const atNorthBoundary = (y === 0);

        // 決定是否結束這一段的向東延伸
        // 在東邊界必須結束；在北邊界永不結束（形成一條長廊）
        const shouldCloseRun = atEastBoundary || (!atNorthBoundary && this.random() < 0.5);

        if (shouldCloseRun) {
          // 從這一段中隨機選一個儲存格向上打通
          const passageCell = currentRun[Math.floor(this.random() * currentRun.length)];
          
          if (!atNorthBoundary) {
              const northNeighbor = this.grid[passageCell.y - 1][passageCell.x];
              removeWalls(passageCell, northNeighbor);
          }

          if (onStep) {
              await onStep({ grid: this.grid, activeSet: [...currentRun], currentCell: passageCell });
          }
          
          // 清空段落，開始新的
          currentRun = [];
        } else {
          // 繼續向東打通
          const eastNeighbor = this.grid[y][x + 1];
          removeWalls(currentCell, eastNeighbor);
          if (onStep) {
              await onStep({ grid: this.grid, activeSet: [...currentRun, eastNeighbor] });
          }
        }
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
}
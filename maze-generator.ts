import type { Cell, MazeGenerationAlgorithm } from './types';

/**
 * 並查集 (Disjoint Set Union) 資料結構，用於 Kruskal 演算法。
 * 透過「按秩合併」和「路徑壓縮」進行了最佳化。
 * @template T 集合中元素的類型。
 */
class DisjointSet<T> {
  private parent = new Map<T, T>();
  private rank = new Map<T, number>();

  /**
   * @param items 初始元素陣列，每個元素都會被建立成一個獨立的集合。
   */
  constructor(items: T[] = []) {
    items.forEach(item => this.makeSet(item));
  }

  /**
   * 建立一個只包含單一元素的新集合。
   * @param item 要加入的元素。
   */
  private makeSet(item: T): void {
    if (!this.parent.has(item)) {
      this.parent.set(item, item);
      this.rank.set(item, 0);
    }
  }

  /**
   * 尋找一個元素的代表元素（根節點），並在過程中進行路徑壓縮。
   * @param item 要尋找的元素。
   * @returns {T} 該元素所在集合的代表元素。
   */
  public find(item: T): T {
    const root = this.parent.get(item)!;
    if (root === item) {
      return item;
    }
    const representative = this.find(root);
    this.parent.set(item, representative); // 路徑壓縮
    return representative;
  }

  /**
   * 合併兩個元素所在的集合。
   * @param item1 第一個元素。
   * @param item2 第二個元素。
   */
  public union(item1: T, item2: T): void {
    const root1 = this.find(item1);
    const root2 = this.find(item2);

    if (root1 !== root2) {
      const rank1 = this.rank.get(root1)!;
      const rank2 = this.rank.get(root2)!;

      // 按秩合併
      if (rank1 < rank2) {
        this.parent.set(root1, root2);
      } else if (rank1 > rank2) {
        this.parent.set(root2, root1);
      } else {
        this.parent.set(root2, root1);
        this.rank.set(root1, rank1 + 1);
      }
    }
  }

  /**
   * 檢查兩個元素是否在同一個集合中。
   * @param item1 第一個元素。
   * @param item2 第二個元素。
   * @returns {boolean} 如果在同一個集合則回傳 true，否則回傳 false。
   */
  public connected(item1: T, item2: T): boolean {
    return this.find(item1) === this.find(item2);
  }
}

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

  /**
   * @param width 迷宮的寬度（儲存格數量）
   * @param height 迷宮的高度（儲存格數量）
   * @param algorithm 要使用的生成演算法
   * @param seed (可選) 用於產生可重現迷宮的隨機種子。
   */
  constructor(width: number, height: number, algorithm: MazeGenerationAlgorithm = 'recursive-backtracker', seed?: number) {
    if (width <= 0 || height <= 0) {
      throw new Error("Width and height must be greater than 0.");
    }
    this.width = width;
    this.height = height;
    this.algorithm = algorithm;

    // 如果提供了種子，則建立一個可預測的隨機數生成器。否則，使用內建的 Math.random。
    if (seed !== undefined) {
      this.random = this.createSeededRandom(seed);
    } else {
      this.random = Math.random;
    }
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
      case 'wilson':
        return this.generateWithWilson();
      case 'growing-tree':
        return this.generateWithGrowingTree();
      case 'binary-tree':
        return this.generateWithBinaryTree();
      case 'recursive-backtracker':
      case 'recursive-backtracker-biased':
      default:
        return this.generateWithRecursiveBacktracker();
    }
  }

  /**
   * 建立一個基於種子的偽隨機數生成器 (PRNG)。
   * 使用 Mulberry32 演算法，這是一個簡單且快速的 32 位元 PRNG。
   * @param seed 用於初始化生成器的數字種子。
   * @returns {() => number} 一個函式，每次呼叫時回傳一個 [0, 1) 之間的偽隨機數。
   */
  private createSeededRandom(seed: number): () => number {
    return function() {
      var t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }

  /**
   * 使用「遞迴回溯」演算法產生迷宮。
   * @returns {Cell[][]} 產生的迷宮網格。
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

          // 有 75% 的機率繼續直線前進，否則隨機選擇一個鄰居
          const bias = 0.75;
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
   * 使用「普林演算法」(Prim's algorithm) 產生迷宮。
   * @returns {Cell[][]} 產生的迷宮網格。
   */
  private generateWithPrim(): Cell[][] {
    // 1. 選擇一個起始儲存格，並將其標記為迷宮的一部分。
    const startCell = this.grid[Math.floor(this.random() * this.height)][Math.floor(this.random() * this.width)];
    startCell.visited = true;

    // 2. 建立一個與迷宮相連的牆壁列表（稱為「邊界」）。
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
        // 打通牆壁，建立通道
        this.removeWalls(from, to);
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
   */
  private generateWithKruskal(): Cell[][] {
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

    // 4. 遍歷所有牆壁，如果牆壁兩側的儲存格不屬於同一個集合，則打通牆壁並合併集合
    for (const wall of walls) {
      const { c1, c2 } = wall;
      if (!dsu.connected(c1, c2)) {
        dsu.union(c1, c2);
        this.removeWalls(c1, c2);
      }
    }

    return this.grid;
  }

  /**
   * 使用「威爾遜演算法」(Wilson's algorithm) 產生迷宮。
   * @returns {Cell[][]} 產生的迷宮網格。
   */
  private generateWithWilson(): Cell[][] {
    // 1. 隨機選擇一個儲存格並將其標記為迷宮的一部分。
    const initialCell = this.grid[Math.floor(this.random() * this.height)][Math.floor(this.random() * this.width)];
    initialCell.visited = true;

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
        const neighbors = this.getNeighbors(current);
        const next = neighbors[Math.floor(this.random() * neighbors.length)];

        const existingIndex = walkPath.indexOf(next);
        if (existingIndex !== -1) {
          // 偵測到迴圈！透過切割路徑來抹除它。
          walkPath = walkPath.slice(0, existingIndex + 1);
        } else {
          walkPath.push(next);
        }
        current = next;
      }

      // 4. 將完成的遊走路徑刻入迷宮中。
      for (let i = 0; i < walkPath.length - 1; i++) {
        this.removeWalls(walkPath[i], walkPath[i + 1]);
        // Mark cells as visited now, so future walks can find the maze.
        walkPath[i].visited = true;
      }
    }

    return this.grid;
  }

  /**
   * 使用「生長樹演算法」(Growing Tree algorithm) 產生迷宮。
   * 這個演算法是遞迴回溯法和普林演算法的綜合體。
   * @returns {Cell[][]} 產生的迷宮網格。
   */
  private generateWithGrowingTree(): Cell[][] {
    // 1. 建立一個作用中儲存格的列表
    const activeSet: Cell[] = [];

    // 2. 選擇一個隨機的起始儲存格，將其標記為已訪問，並加入作用中列表
    const startCell = this.grid[Math.floor(this.random() * this.height)][Math.floor(this.random() * this.width)];
    startCell.visited = true;
    activeSet.push(startCell);

    // 3. 當作用中列表不為空時
    while (activeSet.length > 0) {
      // 3a. 從作用中列表中選擇一個儲存格。
      // 不同的選擇策略會產生不同風格的迷宮：
      // - 'newest': activeSet[activeSet.length - 1] (類似遞迴回溯)
      // - 'random': 隨機選擇 (類似 Prim's)
      // - 'oldest': activeSet[0] (產生長廊)
      // 這裡我們使用隨機選擇策略，以產生類似 Prim's 的迷宮。
      const index = Math.floor(this.random() * activeSet.length);
      const currentCell = activeSet[index];

      // 3b. 尋找該儲存格的未訪問鄰居
      const neighbors = this.getUnvisitedNeighbors(currentCell);

      if (neighbors.length > 0) {
        // 3c. 如果有未訪問的鄰居，隨機選擇一個
        const nextCell = neighbors[Math.floor(this.random() * neighbors.length)];
        this.removeWalls(currentCell, nextCell);
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
   */
  private generateWithBinaryTree(): Cell[][] {
    for (const row of this.grid) {
      for (const cell of row) {
        const neighborsToCarve: Cell[] = [];

        // 演算法可以偏向任何方向，這裡我們選擇北方和西方
        // 如果有北方鄰居，則將其作為一個可能的連接對象
        if (cell.y > 0) {
          neighborsToCarve.push(this.grid[cell.y - 1][cell.x]);
        }
        // 如果有西方鄰居，則將其作為一個可能的連接對象
        if (cell.x > 0) {
          neighborsToCarve.push(this.grid[cell.y][cell.x - 1]);
        }

        // 從可能的鄰居中隨機選擇一個來打通牆壁
        if (neighborsToCarve.length > 0) {
          const neighbor = neighborsToCarve[Math.floor(this.random() * neighborsToCarve.length)];
          this.removeWalls(cell, neighbor);
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

  /**
   * 獲取指定儲存格的所有未訪問鄰居
   * @param cell 要檢查的儲存格
   * @returns {Cell[]} 未訪問的鄰居陣列
   */
  private getUnvisitedNeighbors(cell: Cell): Cell[] {
    return this.getNeighbors(cell).filter(neighbor => !neighbor.visited);
  }

  /**
   * 獲取一個儲存格的所有物理上的鄰居，不論其是否已被訪問。
   * @param cell 要檢查的儲存格。
   * @returns {Cell[]} 一個包含相鄰儲存格的陣列。
   */
  private getNeighbors(cell: Cell): Cell[] {
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
      if (newX >= 0 && newX < this.width && newY >= 0 && newY < this.height) {
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
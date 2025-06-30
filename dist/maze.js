"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MazeSolver = exports.MazeGenerator = void 0;
exports.drawMazeToConsole = drawMazeToConsole;
/**
 * 一個使用多種演算法來產生迷宮的類別。
 */
class MazeGenerator {
    width;
    height;
    grid = [];
    stack = [];
    algorithm;
    /**
     * @param width 迷宮的寬度（儲存格數量）
     * @param height 迷宮的高度（儲存格數量）
     * @param algorithm 要使用的生成演算法
     */
    constructor(width, height, algorithm = 'recursive-backtracker') {
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
    generate() {
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
            case 'recursive-backtracker':
            case 'recursive-backtracker-biased':
            default:
                return this.generateWithRecursiveBacktracker();
        }
    }
    /**
     * 使用「遞迴回溯」演算法產生迷宮。
     * @returns {Cell[][]} 產生的迷宮網格。
     */
    generateWithRecursiveBacktracker() {
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
                let nextCell;
                if (this.algorithm === 'recursive-backtracker-biased') {
                    const previousCell = this.stack.length > 1 ? this.stack[this.stack.length - 2] : null;
                    let straightNeighbor = undefined;
                    if (previousCell) {
                        const lastMoveDx = currentCell.x - previousCell.x;
                        const lastMoveDy = currentCell.y - previousCell.y;
                        straightNeighbor = neighbors.find(n => n.x - currentCell.x === lastMoveDx && n.y - currentCell.y === lastMoveDy);
                    }
                    // 有 75% 的機率繼續直線前進，否則隨機選擇一個鄰居
                    const bias = 0.75;
                    if (straightNeighbor && Math.random() < bias) {
                        nextCell = straightNeighbor;
                    }
                    else {
                        nextCell = neighbors[Math.floor(Math.random() * neighbors.length)]; // 隨機選擇
                    }
                }
                else {
                    // Original random selection
                    nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
                }
                // 打通牆壁
                this.removeWalls(currentCell, nextCell);
                // 將鄰居標記為已訪問並推入堆疊
                nextCell.visited = true;
                this.stack.push(nextCell);
            }
            else {
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
    generateWithPrim() {
        // 1. 選擇一個起始儲存格，並將其標記為迷宮的一部分。
        const startCell = this.grid[Math.floor(Math.random() * this.height)][Math.floor(Math.random() * this.width)];
        startCell.visited = true;
        // 2. 建立一個與迷宮相連的牆壁列表（稱為「邊界」）。
        const frontier = [];
        const addFrontier = (cell) => {
            const { x, y } = cell;
            if (y > 0)
                frontier.push({ from: cell, to: this.grid[y - 1][x] }); // 上
            if (x < this.width - 1)
                frontier.push({ from: cell, to: this.grid[y][x + 1] }); // 右
            if (y < this.height - 1)
                frontier.push({ from: cell, to: this.grid[y + 1][x] }); // 下
            if (x > 0)
                frontier.push({ from: cell, to: this.grid[y][x - 1] }); // 左
        };
        addFrontier(startCell);
        // 3. 當邊界列表不為空時
        while (frontier.length > 0) {
            // Pick a random wall from the frontier
            const randIndex = Math.floor(Math.random() * frontier.length);
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
    generateWithKruskal() {
        // 1. 建立一個包含所有內部牆壁的列表
        const walls = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (y < this.height - 1)
                    walls.push({ c1: this.grid[y][x], c2: this.grid[y + 1][x] });
                if (x < this.width - 1)
                    walls.push({ c1: this.grid[y][x], c2: this.grid[y][x + 1] });
            }
        }
        // 2. 將牆壁列表隨機排序
        for (let i = walls.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [walls[i], walls[j]] = [walls[j], walls[i]];
        }
        // 3. 設定並查集 (Disjoint Set Union) 資料結構
        const parent = new Map();
        const find = (cell) => {
            if (parent.get(cell) === cell)
                return cell;
            const root = find(parent.get(cell));
            parent.set(cell, root); // 路徑壓縮優化
            return root;
        };
        this.grid.flat().forEach(cell => parent.set(cell, cell));
        // 4. 遍歷所有牆壁，如果牆壁兩側的儲存格不屬於同一個集合，則打通牆壁並合併集合
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
     * 使用「威爾遜演算法」(Wilson's algorithm) 產生迷宮。
     * @returns {Cell[][]} 產生的迷宮網格。
     */
    generateWithWilson() {
        // 1. 隨機選擇一個儲存格並將其標記為迷宮的一部分。
        const initialCell = this.grid[Math.floor(Math.random() * this.height)][Math.floor(Math.random() * this.width)];
        initialCell.visited = true;
        // 2. 建立一個包含所有未訪問儲存格的列表，並隨機排序以作為隨機遊走的起點。
        const unvisited = this.grid.flat().filter(c => !c.visited);
        for (let i = unvisited.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [unvisited[i], unvisited[j]] = [unvisited[j], unvisited[i]];
        }
        for (const startCell of unvisited) {
            // 如果此儲存格已被先前的遊走訪問過，則跳過。
            if (startCell.visited)
                continue;
            let walkPath = [startCell];
            let current = startCell;
            // 3. 進行「抹除迴圈的隨機遊走」，直到碰到一個已在迷宮中的儲存格。
            while (!current.visited) {
                const neighbors = this.getNeighbors(current);
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                const existingIndex = walkPath.indexOf(next);
                if (existingIndex !== -1) {
                    // 偵測到迴圈！透過切割路徑來抹除它。
                    walkPath = walkPath.slice(0, existingIndex + 1);
                }
                else {
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
    generateWithGrowingTree() {
        // 1. 建立一個作用中儲存格的列表
        const activeSet = [];
        // 2. 選擇一個隨機的起始儲存格，將其標記為已訪問，並加入作用中列表
        const startCell = this.grid[Math.floor(Math.random() * this.height)][Math.floor(Math.random() * this.width)];
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
            const index = Math.floor(Math.random() * activeSet.length);
            const currentCell = activeSet[index];
            // 3b. 尋找該儲存格的未訪問鄰居
            const neighbors = this.getUnvisitedNeighbors(currentCell);
            if (neighbors.length > 0) {
                // 3c. 如果有未訪問的鄰居，隨機選擇一個
                const nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.removeWalls(currentCell, nextCell);
                nextCell.visited = true;
                activeSet.push(nextCell); // 將新儲存格加入作用中列表
            }
            else {
                // 3d. 如果沒有未訪問的鄰居，將目前儲存格從作用中列表移除
                activeSet.splice(index, 1);
            }
        }
        return this.grid;
    }
    /**
     * 初始化網格，建立所有儲存格並設定所有牆壁
     */
    initializeGrid() {
        this.stack = [];
        this.grid = Array.from({ length: this.height }, (_, y) => Array.from({ length: this.width }, (_, x) => ({
            x,
            y,
            walls: { top: true, right: true, bottom: true, left: true },
            visited: false,
        })));
    }
    /**
     * 獲取指定儲存格的所有未訪問鄰居
     * @param cell 要檢查的儲存格
     * @returns {Cell[]} 未訪問的鄰居陣列
     */
    getUnvisitedNeighbors(cell) {
        return this.getNeighbors(cell).filter(neighbor => !neighbor.visited);
    }
    /**
     * 獲取一個儲存格的所有物理上的鄰居，不論其是否已被訪問。
     * @param cell 要檢查的儲存格。
     * @returns {Cell[]} 一個包含相鄰儲存格的陣列。
     */
    getNeighbors(cell) {
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
    removeWalls(a, b) {
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
exports.MazeGenerator = MazeGenerator;
/**
 * 一個使用最小堆實作的優先權佇列，用於 A* 演算法。
 * 優先權越低，越先被取出。
 */
class PriorityQueue {
    heap = [];
    /**
     * 插入一個帶有優先權的項目
     * @param item 要插入的項目
     * @param priority 優先權 (數值越小越高)
     */
    insert(item, priority) {
        this.heap.push({ item, priority });
        this.siftUp(this.heap.length - 1);
    }
    /**
     * 取出並回傳優先權最高的項目 (最小的值)
     * @returns {T | null} 優先權最高的項目，如果佇列為空則回傳 null
     */
    extractMin() {
        if (this.isEmpty()) {
            return null;
        }
        this.swap(0, this.heap.length - 1);
        const { item } = this.heap.pop();
        if (!this.isEmpty()) {
            this.siftDown(0);
        }
        return item;
    }
    /**
     * 檢查佇列是否為空
     * @returns {boolean} 如果為空則為 true
     */
    isEmpty() {
        return this.heap.length === 0;
    }
    getParentIndex(i) {
        return Math.floor((i - 1) / 2);
    }
    getLeftChildIndex(i) {
        return 2 * i + 1;
    }
    getRightChildIndex(i) {
        return 2 * i + 2;
    }
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
    siftUp(i) {
        let parentIndex = this.getParentIndex(i);
        while (i > 0 && this.heap[i].priority < this.heap[parentIndex].priority) {
            this.swap(i, parentIndex);
            i = parentIndex;
            parentIndex = this.getParentIndex(i);
        }
    }
    siftDown(i) {
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
        const openSet = new PriorityQueue();
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
/**
 * 將迷宮資料結構繪製到主控台
 * @param grid 迷宮的二維陣列
 * @param path (可選) 要繪製的路徑，儲存格陣列
 */
function drawMazeToConsole(grid, path = []) {
    const height = grid.length;
    if (height === 0)
        return;
    const width = grid[0].length;
    if (width === 0)
        return;
    const outputLines = [];
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
function createSolveAndPrintMaze(width, height, algorithm) {
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
createSolveAndPrintMaze(15, 10, 'wilson');
createSolveAndPrintMaze(15, 10, 'growing-tree');

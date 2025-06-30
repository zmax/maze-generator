# TypeScript 迷宮生成與求解器

這是一個使用 TypeScript 編寫的專案，專門用於生成和解決迷宮。它實現了多種經典的迷宮生成演算法，並提供了一個使用 A* 演算法的求解器。所有結果都可以在主控台中以 ASCII 藝術的形式視覺化呈現。



## ✨ 功能特色

- **多種生成演算法**:
  - **遞迴回溯法 (Recursive Backtracker)**: 經典的深度優先搜尋法，產生路徑長且曲折的迷宮。
  - **帶有偏好性的遞迴回溯法 (Biased Recursive Backtracker)**: 產生較多長廊的變體，直線偏好值可配置。
  - **普林演算法 (Prim's Algorithm)**: 從一點開始生長，風格類似最小生成樹。
  - **克魯斯克爾演算法 (Kruskal's Algorithm)**: 產生含有大量短小死路的迷宮。
  - **威爾遜演算法 (Wilson's Algorithm)**: 透過隨機遊走產生，生成非常均勻、無偏見的迷宮。
  - **生長樹演算法 (Growing Tree Algorithm)**: 普林演算法和遞迴回溯法的混合體，可配置不同策略（最新、隨機、最舊）以產生不同風格的迷宮。
  - **二元樹演算法 (Binary Tree Algorithm)**: 速度極快，可配置偏好方向（例如北方/西方）以產生不同紋理。
  - **Aldous-Broder 演算法**: 另一種產生均勻生成樹的演算法，原理簡單但效率較低。
- **高效求解器**: 使用高效的「雙向 A* 演算法」來尋找從起點到終點的最短路徑。
- **主控台視覺化**: 將生成的迷宮和解答路徑以 ASCII 形式清晰地繪製在主控台中。
- **可重現的隨機性**: 可選的隨機種子允許您重現完全相同的迷宮。
- **零依賴**: 純 TypeScript 實現，不需任何外部函式庫。
- **型別安全**: 充分利用 TypeScript 的型別系統，程式碼清晰且易於維護。

## 🚀 如何開始

### 環境需求

- [Node.js](https://nodejs.org/) (建議版本 16 或以上)
- [TypeScript](https://www.typescriptlang.org/)
- `ts-node` (用於直接執行 TypeScript 檔案)

### 安裝與執行

1.  若尚未安裝 `ts-node`，請透過 npm 進行全域安裝：
    ```bash
    npm install -g ts-node
    ```

2.  執行專案中包含的範例程式碼，它會為每種演算法產生一個 15x10 的迷宮並求解：
    ```bash
    ts-node d:/zmax/works/vibe-coding/maze/maze.ts
    ```

## 🛠️ API 使用方式

您可以輕易地在您自己的專案中引入並使用這些模組。
```typescript
import { MazeGenerator } from './maze-generator';
import { MazeSolver } from './maze-solver';
import { drawMazeToConsole } from './maze-drawer';
import type { Point, MazeGeneratorOptions } from './types';

// 1. 選擇一種演算法，產生一個 20x10 的迷宮
const options: MazeGeneratorOptions = {
  seed: 12345,
  growingTreeStrategy: 'newest', // for 'growing-tree': 'newest' | 'random' | 'oldest'
  straightBias: 0.9,             // for 'recursive-backtracker-biased': a value between 0.0 and 1.0
  binaryTreeBias: 'south-east', // for 'binary-tree': 'north-west' | 'north-east' | 'south-west' | 'south-east'
};
const mazeGenerator = new MazeGenerator(20, 10, 'aldous-broder', options);
const mazeGrid = mazeGenerator.generate();

// 2. 設定迷宮的入口和出口
const start: Point = { x: 0, y: 0 };
const end: Point = { x: 19, y: 9 };

// 打開入口和出口的牆壁
mazeGrid[start.y][start.x].walls.top = false;
mazeGrid[end.y][end.x].walls.bottom = false;

// 3. 建立求解器並解決迷宮
const solver = new MazeSolver(mazeGrid);
const path = solver.solve(start, end);

// 4. 在主控台繪製迷宮和解答路徑
console.log("使用 Aldous-Broder 演算法產生的 20x10 迷宮：");
drawMazeToConsole(mazeGrid, path);
```

### 輸出範例

執行上述程式碼後，您將在主控台看到類似下方的輸出：

```
使用 Prim's Algorithm 產生的 20x10 迷宮：
+   +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
| .   .   .   . |   |           |           |   |   |   |       |   |       |
+ +---+ +---+---+ + + +---+---+---+---+---+---+ + + + + + +---+---+ + +---+---+
| | .   . |   | . | |   |       |   |   |   |   | | | | |   |   | | | |   |
+ + +---+ + + + + + +---+---+---+ + + + + + +---+ + + + +---+ + + + + + +---+
| |   | . | | | . |   |       |   | | | | |   |   | | |   | | | | | | |   |
+ +---+ + + + + + +---+---+---+---+ + + + +---+---+---+---+ + + + + + +---+---+
|   | .   . | | .   .   .   .   . | | | |   |   |   |   | | | | | | |   |   |
+---+ +---+---+ +---+---+---+---+ + + + + +---+---+---+ + + + + + + +---+---+
|   |   |       |   |   |   | .   . | | | |   |   |   | | | | | | |   |   |
+ +---+---+---+---+---+---+ + +---+---+ + +---+ + + + + + + + + + +---+---+---+
| |   |   |   |   |   |   | |   | .   . |   | | | | | | | | | | |   |   |   |
+ +---+---+---+---+---+---+---+---+ +---+---+ + + + + + + + + + +---+---+---+
|   |   |   |   |   |   |   |   | | .   . | | | | | | | | | | |   |   |   |
+---+---+---+---+---+---+---+---+ + +---+ + + + + + + + + + + +---+---+---+---+
|   |   |   |   |   |   |   |   | | | .   . | | | | | | | | |   |   |   |   |
+---+---+---+---+---+---+---+---+---+ +---+ + + + + + + + + +---+---+---+---+
|   |   |   |   |   |   |   |   |   |   | . | | | | | | | |   |   |   |   |
+---+---+---+---+---+---+---+---+---+---+ + + + + + + + + +---+---+---+---+---+
|   |   |   |   |   |   |   |   |   |   | .   .   .   .   .   .   .   .   . |
+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+   +
```

## 🏛️ 專案結構

- **`maze.ts`**: 專案的主要進入點，包含執行範例。
- **`types.ts`**: 包含共享的 TypeScript 型別定義，如 `Cell` 和 `Point`。
- **`maze-generator.ts`**: 包含 `MazeGenerator` 類別和所有迷宮生成演算法的邏輯。
- **`maze-solver.ts`**: 包含 `MazeSolver` 類別和 A* 求解演算法的邏輯。
- **`maze-drawer.ts`**: 包含 `drawMazeToConsole` 輔助函式，用於在主控台繪製迷宮。
- **`maze-utils.ts`**: 包含通用的輔助函式，如網格操作和隨機數生成。
- **`data-structures/`**: 包含通用的資料結構。
  - **`disjoint-set.ts`**: 並查集 (Disjoint Set Union) 的實作。
  - **`priority-queue.ts`**: 最小堆 (Min-Heap) 優先權佇列的實作。

## 💡 未來可擴充方向

- **圖形化介面 (GUI)**: 使用 HTML Canvas、React 或其他前端框架建立一個互動式的圖形介面，讓使用者可以即時看到迷宮生成過程。
- **新增求解演算法**: 加入更多路徑尋找演算法，例如廣度優先搜尋 (BFS) 或 Dijkstra 演算法，並比較其效能。
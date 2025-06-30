import type { Cell } from './types';

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
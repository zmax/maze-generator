import type { Cell } from './types';

export interface HighlightSets {
  path?: Set<Cell>;
  forwardOpen?: Set<Cell>;
  forwardClosed?: Set<Cell>;
  backwardOpen?: Set<Cell>;
  backwardClosed?: Set<Cell>;
}

/**
 * 將迷宮資料結構繪製到主控台
 * @param grid 迷宮的二維陣列
 * @param pathOrHighlights (可選) 要繪製的路徑，或是一個包含多個高亮集合的物件
 */
export function drawMazeToConsole(grid: Cell[][], pathOrHighlights: Cell[] | HighlightSets = []): void {
  const height = grid.length;
  if (height === 0) return;
  const width = grid[0].length;
  if (width === 0) return;
 
  const outputLines: string[] = [];
  
  const highlights: HighlightSets = Array.isArray(pathOrHighlights)
    ? { path: new Set(pathOrHighlights) }
    : pathOrHighlights;
  
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
      let cellContent = '   ';

      if (highlights.backwardClosed?.has(cell)) cellContent = ' X ';
      else if (highlights.forwardClosed?.has(cell)) cellContent = ' x ';
      
      if (highlights.backwardOpen?.has(cell)) cellContent = ' O ';
      else if (highlights.forwardOpen?.has(cell)) cellContent = ' o ';

      if (highlights.path?.has(cell)) {
        cellContent = ' . ';
      }

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
import type { Cell, GenerationStep, SolverStep } from '../types';

const COLORS = {
  background: '#FFFFFF',
  wall: '#333333',
  path: '#81C784', // Green
  // Generation
  current: '#FFEB3B', // Yellow
  stack: '#90CAF9', // Blue
  activeSet: '#FFCC80', // Orange
  walkPath: '#CE93D8', // Purple
  // Solving
  forwardOpen: '#C8E6C9', // Light Green
  forwardClosed: '#FFCDD2', // Light Red
  backwardOpen: '#BBDEFB', // Light Blue
  backwardClosed: '#FFECB3', // Light Yellow
  meetingNode: '#F48FB1', // Pink
};

export class CanvasDrawer {
  private ctx: CanvasRenderingContext2D;
  private mazeWidth: number;
  private mazeHeight: number;
  private cellSize: number;
  private wallThickness: number;

  constructor(canvas: HTMLCanvasElement, mazeWidth: number, mazeHeight: number) {
    this.ctx = canvas.getContext('2d')!;
    this.mazeWidth = mazeWidth;
    this.mazeHeight = mazeHeight;

    // 自動計算儲存格大小以適應畫布
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    this.cellSize = Math.floor(Math.min(canvasWidth / mazeWidth, canvasHeight / mazeHeight));
    this.wallThickness = Math.max(1, Math.floor(this.cellSize / 10));
  }

  private clearCanvas() {
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, this.mazeWidth * this.cellSize, this.mazeHeight * this.cellSize);
  }

  private drawCell(cell: Cell, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      cell.x * this.cellSize,
      cell.y * this.cellSize,
      this.cellSize,
      this.cellSize
    );
  }

  private drawGrid(grid: Cell[][]) {
    this.ctx.strokeStyle = COLORS.wall;
    this.ctx.lineWidth = this.wallThickness;
    this.ctx.beginPath();

    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        const cell = grid[y][x];
        const cx = x * this.cellSize;
        const cy = y * this.cellSize;

        if (cell.walls.top) {
          this.ctx.moveTo(cx, cy);
          this.ctx.lineTo(cx + this.cellSize, cy);
        }
        if (cell.walls.right) {
          this.ctx.moveTo(cx + this.cellSize, cy);
          this.ctx.lineTo(cx + this.cellSize, cy + this.cellSize);
        }
        if (cell.walls.bottom) {
          this.ctx.moveTo(cx + this.cellSize, cy + this.cellSize);
          this.ctx.lineTo(cx, cy + this.cellSize);
        }
        if (cell.walls.left) {
          this.ctx.moveTo(cx, cy + this.cellSize);
          this.ctx.lineTo(cx, cy);
        }
      }
    }
    this.ctx.stroke();
  }

  public renderStep(step: GenerationStep | SolverStep) {
    this.clearCanvas();

    // --- 繪製背景高亮 ---
    // 求解過程
    if ('closedSetForward' in step) {
      step.closedSetBackward.forEach(cell => this.drawCell(cell, COLORS.backwardClosed));
      step.closedSetForward.forEach(cell => this.drawCell(cell, COLORS.forwardClosed));
      step.openSetBackward.forEach(cell => this.drawCell(cell, COLORS.backwardOpen));
      step.openSetForward.forEach(cell => this.drawCell(cell, COLORS.forwardOpen));
      if (step.meetingNode) this.drawCell(step.meetingNode, COLORS.meetingNode);
    }
    // 生成過程
    else {
      if (step.activeSet) step.activeSet.forEach(cell => this.drawCell(cell, COLORS.activeSet));
      if (step.stack) step.stack.forEach(cell => this.drawCell(cell, COLORS.stack));
      if (step.walkPath) step.walkPath.forEach(cell => this.drawCell(cell, COLORS.walkPath));
      if (step.currentCell) this.drawCell(step.currentCell, COLORS.current);
    }

    // --- 繪製牆壁 ---
    this.drawGrid(step.grid);
  }

  public drawFinalPath(grid: Cell[][], path: Cell[]) {
    this.clearCanvas();
    this.drawGrid(grid);
    path.forEach(cell => this.drawCell(cell, COLORS.path));
    // 重新繪製牆壁以覆蓋路徑顏色
    this.drawGrid(grid);
  }

  public resizeCanvas(canvas: HTMLCanvasElement) {
    const container = canvas.parentElement!;
    const size = Math.min(container.clientWidth, container.clientHeight);
    canvas.width = size;
    canvas.height = size;
    this.cellSize = Math.floor(Math.min(canvas.width / this.mazeWidth, canvas.height / this.mazeHeight));
    this.wallThickness = Math.max(1, Math.floor(this.cellSize / 10));
  }
}
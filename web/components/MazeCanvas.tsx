import React, { useRef, useEffect } from 'react';
import { CanvasDrawer } from '../canvas-drawer';
import type { Cell } from '../../types';

interface MazeCanvasProps {
  width: number;
  height: number;
  drawerRef: React.MutableRefObject<CanvasDrawer | null>;
  grid: Cell[][] | null;
}

export const MazeCanvas: React.FC<MazeCanvasProps> = ({ width, height, drawerRef, grid }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      drawerRef.current = new CanvasDrawer(canvas, width, height);
      drawerRef.current.resizeCanvas(canvas);
      if (grid) {
        drawerRef.current.drawFinalPath(grid, []);
      }
    }
  }, [width, height, grid, drawerRef]);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} />
    </div>
  );
};
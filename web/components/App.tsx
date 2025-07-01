import React, { useState, useCallback, useRef } from 'react';
import { MazeGenerator } from '../../maze-generator';
import { MazeSolver } from '../../maze-solver';
import type { Cell, GenerationStepCallback, MazeGeneratorOptions, SolverStepCallback } from '../../types';
import { CanvasDrawer } from '../canvas-drawer';
import { ControlsPanel, type ControlSettings } from './ControlsPanel';
import { MazeCanvas } from './MazeCanvas';

export const App: React.FC = () => {
  const [settings, setSettings] = useState<ControlSettings>({
    algorithm: 'recursive-backtracker',
    width: 30,
    height: 20,
    seed: '12345',
    delay: 10,
    rbBias: 0.75,
    gtStrategy: 'random',
    btBias: 'north-west',
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const [currentGrid, setCurrentGrid] = useState<Cell[][] | null>(null);
  const drawerRef = useRef<CanvasDrawer | null>(null);
  const stopAnimationFlag = useRef(false);

  const handleGenerate = useCallback(async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentGrid(null);
    stopAnimationFlag.current = false;

    const { algorithm, width, height, seed, delay, ...algoOptions } = settings;
    const numericSeed = seed ? parseInt(seed, 10) : undefined;

    const onStep: GenerationStepCallback = async (step) => {
      if (stopAnimationFlag.current) throw new Error("Animation stopped by user.");
      if (drawerRef.current) {
        drawerRef.current.renderStep(step);
      }
      await new Promise(r => setTimeout(r, delay));
    };

    const options: MazeGeneratorOptions = {
      seed: numericSeed,
      onStep,
      straightBias: algoOptions.rbBias,
      growingTreeStrategy: algoOptions.gtStrategy,
      binaryTreeBias: algoOptions.btBias,
    };

    const generator = new MazeGenerator(width, height, algorithm, options);

    try {
      const grid = await generator.generate();
      setCurrentGrid(grid);
      if (drawerRef.current) {
        drawerRef.current.drawFinalPath(grid, []);
      }
    } catch (e) {
      console.log(e); // Log stop error
    } finally {
      setIsAnimating(false);
    }
  }, [isAnimating, settings]);

  const handleSolve = useCallback(async () => {
    if (isAnimating || !currentGrid) return;
    setIsAnimating(true);
    stopAnimationFlag.current = false;

    const { delay } = settings;
    const start = { x: 0, y: 0 };
    const end = { x: currentGrid[0].length - 1, y: currentGrid.length - 1 };

    const onStep: SolverStepCallback = async (step) => {
      if (stopAnimationFlag.current) throw new Error("Animation stopped by user.");
      if (drawerRef.current) {
        drawerRef.current.renderStep(step);
      }
      await new Promise(r => setTimeout(r, delay));
    };

    const solver = new MazeSolver(currentGrid, { onStep });

    try {
      const path = await solver.solve(start, end);
      if (drawerRef.current) {
        drawerRef.current.drawFinalPath(currentGrid, path);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsAnimating(false);
    }
  }, [isAnimating, currentGrid, settings.delay]);

  const handleStop = useCallback(() => {
    stopAnimationFlag.current = true;
  }, []);

  return (
    <div className="app-container">
      <ControlsPanel
        settings={settings}
        onSettingsChange={setSettings}
        onGenerate={handleGenerate}
        onSolve={handleSolve}
        onStop={handleStop}
        isAnimating={isAnimating}
        isMazeGenerated={!!currentGrid}
      />
      <MazeCanvas
        width={settings.width}
        height={settings.height}
        drawerRef={drawerRef}
        grid={currentGrid}
      />
    </div>
  );
};
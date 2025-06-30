import { MazeGenerator } from '../maze-generator';
import { MazeSolver } from '../maze-solver';
import type { Cell, GenerationStepCallback, MazeGenerationAlgorithm, MazeGeneratorOptions, SolverStepCallback, GrowingTreeStrategy, BinaryTreeBias } from '../types';
import { CanvasDrawer } from './canvas-drawer';

class App {
  private canvas: HTMLCanvasElement;
  private drawer: CanvasDrawer | null = null;
  private currentGrid: Cell[][] | null = null;
  private isAnimating = false;
  private stopAnimationFlag = false;

  // UI Elements
  private algoSelect: HTMLSelectElement;
  private widthInput: HTMLInputElement;
  private heightInput: HTMLInputElement;
  private seedInput: HTMLInputElement;
  private delayInput: HTMLInputElement;
  private generateBtn: HTMLButtonElement;
  private solveBtn: HTMLButtonElement;
  private stopBtn: HTMLButtonElement;

  // Option Panels
  private rbBiasOption: HTMLElement;
  private rbBiasInput: HTMLInputElement;
  private gtStrategyOption: HTMLElement;
  private gtStrategySelect: HTMLSelectElement;
  private btBiasOption: HTMLElement;
  private btBiasSelect: HTMLSelectElement;

  constructor() {
    this.canvas = document.getElementById('maze-canvas') as HTMLCanvasElement;
    this.algoSelect = document.getElementById('algo-select') as HTMLSelectElement;
    this.widthInput = document.getElementById('width-input') as HTMLInputElement;
    this.heightInput = document.getElementById('height-input') as HTMLInputElement;
    this.seedInput = document.getElementById('seed-input') as HTMLInputElement;
    this.delayInput = document.getElementById('delay-input') as HTMLInputElement;
    this.generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
    this.solveBtn = document.getElementById('solve-btn') as HTMLButtonElement;
    this.stopBtn = document.getElementById('stop-btn') as HTMLButtonElement;

    this.rbBiasOption = document.getElementById('rb-bias-option')!;
    this.rbBiasInput = document.getElementById('rb-bias-input') as HTMLInputElement;
    this.gtStrategyOption = document.getElementById('gt-strategy-option')!;
    this.gtStrategySelect = document.getElementById('gt-strategy-select') as HTMLSelectElement;
    this.btBiasOption = document.getElementById('bt-bias-option')!;
    this.btBiasSelect = document.getElementById('bt-bias-select') as HTMLSelectElement;

    this.populateSelects();
    this.bindEvents();
  }

  private populateSelects() {
    const algorithms: MazeGenerationAlgorithm[] = ['recursive-backtracker', 'recursive-backtracker-biased', 'prim', 'kruskal', 'wilson', 'growing-tree', 'binary-tree', 'aldous-broder', 'sidewinder'];
    algorithms.forEach(algo => {
      const option = document.createElement('option');
      option.value = algo;
      option.textContent = algo.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      this.algoSelect.appendChild(option);
    });

    const gtStrategies: GrowingTreeStrategy[] = ['newest', 'random', 'oldest'];
    gtStrategies.forEach(s => this.gtStrategySelect.add(new Option(s, s)));

    const btBiases: BinaryTreeBias[] = ['north-west', 'north-east', 'south-west', 'south-east'];
    btBiases.forEach(b => this.btBiasSelect.add(new Option(b, b)));
  }

  private bindEvents() {
    this.generateBtn.addEventListener('click', () => this.runGeneration());
    this.solveBtn.addEventListener('click', () => this.runSolver());
    this.stopBtn.addEventListener('click', () => { this.stopAnimationFlag = true; });
    this.algoSelect.addEventListener('change', () => this.toggleOptionsPanel());
    window.addEventListener('resize', () => this.handleResize());
    this.toggleOptionsPanel(); // Initial call
  }

  private toggleOptionsPanel() {
    const selectedAlgo = this.algoSelect.value;
    this.rbBiasOption.classList.toggle('hidden', selectedAlgo !== 'recursive-backtracker-biased');
    this.gtStrategyOption.classList.toggle('hidden', selectedAlgo !== 'growing-tree');
    this.btBiasOption.classList.toggle('hidden', selectedAlgo !== 'binary-tree');
  }

  private handleResize() {
    if (this.drawer) {
      this.drawer.resizeCanvas(this.canvas);
      if (this.currentGrid) {
        // Redraw the current state on resize
        this.drawer.drawFinalPath(this.currentGrid, []);
      }
    }
  }

  private setUiState(isAnimating: boolean) {
    this.isAnimating = isAnimating;
    this.generateBtn.disabled = isAnimating;
    this.solveBtn.disabled = isAnimating || !this.currentGrid;
    this.stopBtn.disabled = !isAnimating;
  }

  private getOptions(): MazeGeneratorOptions {
    const seed = this.seedInput.value ? parseInt(this.seedInput.value, 10) : undefined;
    const options: MazeGeneratorOptions = { seed };
    
    switch (this.algoSelect.value) {
      case 'recursive-backtracker-biased':
        options.straightBias = parseFloat(this.rbBiasInput.value);
        break;
      case 'growing-tree':
        options.growingTreeStrategy = this.gtStrategySelect.value as GrowingTreeStrategy;
        break;
      case 'binary-tree':
        options.binaryTreeBias = this.btBiasSelect.value as BinaryTreeBias;
        break;
    }
    return options;
  }

  async runGeneration() {
    if (this.isAnimating) return;
    this.setUiState(true);
    this.stopAnimationFlag = false;

    const width = parseInt(this.widthInput.value, 10);
    const height = parseInt(this.heightInput.value, 10);
    const algorithm = this.algoSelect.value as MazeGenerationAlgorithm;
    const options = this.getOptions();
    const delay = parseInt(this.delayInput.value, 10);

    this.drawer = new CanvasDrawer(this.canvas, width, height);
    this.drawer.resizeCanvas(this.canvas);

    const onStep: GenerationStepCallback = async (step) => {
      if (this.stopAnimationFlag) throw new Error("Animation stopped by user.");
      this.drawer!.renderStep(step);
      await new Promise(r => setTimeout(r, delay));
    };

    const generator = new MazeGenerator(width, height, algorithm, { ...options, onStep });

    try {
      this.currentGrid = await generator.generate();
      this.drawer.drawFinalPath(this.currentGrid, []);
    } catch (e) {
      console.log(e); // Log stop error
    } finally {
      this.setUiState(false);
    }
  }

  async runSolver() {
    if (this.isAnimating || !this.currentGrid) return;
    this.setUiState(true);
    this.stopAnimationFlag = false;

    const delay = parseInt(this.delayInput.value, 10);
    const start = { x: 0, y: 0 };
    const end = { x: this.currentGrid[0].length - 1, y: this.currentGrid.length - 1 };

    const onStep: SolverStepCallback = async (step) => {
      if (this.stopAnimationFlag) throw new Error("Animation stopped by user.");
      this.drawer!.renderStep(step);
      await new Promise(r => setTimeout(r, delay));
    };

    const solver = new MazeSolver(this.currentGrid, { onStep });

    try {
      const path = await solver.solve(start, end);
      this.drawer!.drawFinalPath(this.currentGrid, path);
    } catch (e) {
      console.log(e); // Log stop error
    } finally {
      this.setUiState(false);
    }
  }
}

new App();
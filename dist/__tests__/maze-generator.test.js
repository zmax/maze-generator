"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maze_generator_1 = require("../maze-generator");
describe('MazeGenerator', () => {
    it('should initialize with correct dimensions', () => {
        const generator = new maze_generator_1.MazeGenerator(10, 20);
        expect(generator.width).toBe(10);
        expect(generator.height).toBe(20);
    });
    it('should throw an error for invalid dimensions', () => {
        expect(() => new maze_generator_1.MazeGenerator(0, 10)).toThrow('Width and height must be greater than 0.');
        expect(() => new maze_generator_1.MazeGenerator(10, -5)).toThrow('Width and height must be greater than 0.');
    });
    it('should generate a grid with the correct dimensions', async () => {
        const generator = new maze_generator_1.MazeGenerator(5, 8);
        const grid = await generator.generate();
        expect(grid.length).toBe(8); // height
        expect(grid[0].length).toBe(5); // width
    });
    it('should produce identical mazes for the same seed', async () => {
        const seed = 42;
        const generator1 = new maze_generator_1.MazeGenerator(10, 10, 'recursive-backtracker', { seed });
        const grid1 = await generator1.generate();
        const generator2 = new maze_generator_1.MazeGenerator(10, 10, 'recursive-backtracker', { seed });
        const grid2 = await generator2.generate();
        // 使用 JSON.stringify 進行深度比較
        expect(JSON.stringify(grid1)).toEqual(JSON.stringify(grid2));
    });
    it('should produce different mazes for different seeds', async () => {
        const generator1 = new maze_generator_1.MazeGenerator(10, 10, 'recursive-backtracker', { seed: 123 });
        const grid1 = await generator1.generate();
        const generator2 = new maze_generator_1.MazeGenerator(10, 10, 'recursive-backtracker', { seed: 456 });
        const grid2 = await generator2.generate();
        expect(JSON.stringify(grid1)).not.toEqual(JSON.stringify(grid2));
    });
    // 測試所有演算法是否都能無錯誤地執行
    const algorithms = [
        'recursive-backtracker',
        'recursive-backtracker-biased',
        'prim',
        'kruskal',
        'wilson',
        'growing-tree',
        'binary-tree',
        'aldous-broder',
    ];
    algorithms.forEach(algo => {
        it(`should generate a maze using the ${algo} algorithm without errors`, async () => {
            const generator = new maze_generator_1.MazeGenerator(5, 5, algo);
            await expect(generator.generate()).resolves.toBeDefined();
        });
    });
    it('should produce different mazes for different growing-tree strategies with the same seed', async () => {
        const seed = 999;
        const genNewest = new maze_generator_1.MazeGenerator(10, 10, 'growing-tree', { seed, growingTreeStrategy: 'newest' });
        const gridNewest = await genNewest.generate();
        const genRandom = new maze_generator_1.MazeGenerator(10, 10, 'growing-tree', { seed, growingTreeStrategy: 'random' });
        const gridRandom = await genRandom.generate();
        const genOldest = new maze_generator_1.MazeGenerator(10, 10, 'growing-tree', { seed, growingTreeStrategy: 'oldest' });
        const gridOldest = await genOldest.generate();
        const strNewest = JSON.stringify(gridNewest);
        const strRandom = JSON.stringify(gridRandom);
        const strOldest = JSON.stringify(gridOldest);
        expect(strNewest).not.toEqual(strRandom);
        expect(strNewest).not.toEqual(strOldest);
        expect(strRandom).not.toEqual(strOldest);
    });
    it('should throw an error for invalid straightBias option', () => {
        expect(() => new maze_generator_1.MazeGenerator(10, 10, 'recursive-backtracker-biased', { straightBias: -0.1 })).toThrow('straightBias option must be between 0.0 and 1.0.');
        expect(() => new maze_generator_1.MazeGenerator(10, 10, 'recursive-backtracker-biased', { straightBias: 1.1 })).toThrow('straightBias option must be between 0.0 and 1.0.');
    });
    it('should produce different mazes for different straightBias values with the same seed', async () => {
        const seed = 888;
        const genLowBias = new maze_generator_1.MazeGenerator(10, 10, 'recursive-backtracker-biased', { seed, straightBias: 0.1 });
        const gridLowBias = await genLowBias.generate();
        const genHighBias = new maze_generator_1.MazeGenerator(10, 10, 'recursive-backtracker-biased', { seed, straightBias: 0.9 });
        const gridHighBias = await genHighBias.generate();
        const strLowBias = JSON.stringify(gridLowBias);
        const strHighBias = JSON.stringify(gridHighBias);
        expect(strLowBias).not.toEqual(strHighBias);
    });
    it('should produce different mazes for different binary-tree biases with the same seed', async () => {
        const seed = 777;
        const genNW = new maze_generator_1.MazeGenerator(10, 10, 'binary-tree', { seed, binaryTreeBias: 'north-west' });
        const gridNW = await genNW.generate();
        const genSE = new maze_generator_1.MazeGenerator(10, 10, 'binary-tree', { seed, binaryTreeBias: 'south-east' });
        const gridSE = await genSE.generate();
        const strNW = JSON.stringify(gridNW);
        const strSE = JSON.stringify(gridSE);
        expect(strNW).not.toEqual(strSE);
    });
});

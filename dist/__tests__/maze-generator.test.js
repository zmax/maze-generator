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
    it('should generate a grid with the correct dimensions', () => {
        const generator = new maze_generator_1.MazeGenerator(5, 8);
        const grid = generator.generate();
        expect(grid.length).toBe(8); // height
        expect(grid[0].length).toBe(5); // width
    });
    it('should produce identical mazes for the same seed', () => {
        const seed = 42;
        const generator1 = new maze_generator_1.MazeGenerator(10, 10, 'recursive-backtracker', { seed });
        const grid1 = generator1.generate();
        const generator2 = new maze_generator_1.MazeGenerator(10, 10, 'recursive-backtracker', { seed });
        const grid2 = generator2.generate();
        // 使用 JSON.stringify 進行深度比較
        expect(JSON.stringify(grid1)).toEqual(JSON.stringify(grid2));
    });
    it('should produce different mazes for different seeds', () => {
        const generator1 = new maze_generator_1.MazeGenerator(10, 10, 'recursive-backtracker', { seed: 123 });
        const grid1 = generator1.generate();
        const generator2 = new maze_generator_1.MazeGenerator(10, 10, 'recursive-backtracker', { seed: 456 });
        const grid2 = generator2.generate();
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
    ];
    algorithms.forEach(algo => {
        it(`should generate a maze using the ${algo} algorithm without errors`, () => {
            const generator = new maze_generator_1.MazeGenerator(5, 5, algo);
            expect(() => generator.generate()).not.toThrow();
        });
    });
    it('should produce different mazes for different growing-tree strategies with the same seed', () => {
        const seed = 999;
        const genNewest = new maze_generator_1.MazeGenerator(10, 10, 'growing-tree', { seed, growingTreeStrategy: 'newest' });
        const gridNewest = genNewest.generate();
        const genRandom = new maze_generator_1.MazeGenerator(10, 10, 'growing-tree', { seed, growingTreeStrategy: 'random' });
        const gridRandom = genRandom.generate();
        const genOldest = new maze_generator_1.MazeGenerator(10, 10, 'growing-tree', { seed, growingTreeStrategy: 'oldest' });
        const gridOldest = genOldest.generate();
        const strNewest = JSON.stringify(gridNewest);
        const strRandom = JSON.stringify(gridRandom);
        const strOldest = JSON.stringify(gridOldest);
        expect(strNewest).not.toEqual(strRandom);
        expect(strNewest).not.toEqual(strOldest);
        expect(strRandom).not.toEqual(strOldest);
    });
});

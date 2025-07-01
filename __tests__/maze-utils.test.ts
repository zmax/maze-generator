import { removeWalls, getNeighbors, getUnvisitedNeighbors, createSeededRandom } from '../maze-utils';
import type { Cell } from '../types';

describe('maze-utils', () => {
  describe('removeWalls', () => {
    it('should remove walls between horizontally adjacent cells', () => {
      const cellA: Cell = { x: 0, y: 0, walls: { top: true, right: true, bottom: true, left: true }, visited: false };
      const cellB: Cell = { x: 1, y: 0, walls: { top: true, right: true, bottom: true, left: true }, visited: false };
      removeWalls(cellA, cellB);
      expect(cellA.walls.right).toBe(false);
      expect(cellB.walls.left).toBe(false);
    });

    it('should remove walls between vertically adjacent cells', () => {
      const cellA: Cell = { x: 0, y: 0, walls: { top: true, right: true, bottom: true, left: true }, visited: false };
      const cellC: Cell = { x: 0, y: 1, walls: { top: true, right: true, bottom: true, left: true }, visited: false };
      removeWalls(cellA, cellC);
      expect(cellA.walls.bottom).toBe(false);
      expect(cellC.walls.top).toBe(false);
    });
  });

  describe('getNeighbors', () => {
    // Create a 3x3 grid for testing
    const grid = Array.from({ length: 3 }, (_, y) =>
      Array.from({ length: 3 }, (_, x) => ({
        x, y, walls: { top: true, right: true, bottom: true, left: true }, visited: false
      }))
    );

    it('should get neighbors for a corner cell', () => {
      const neighbors = getNeighbors(grid[0][0], grid, 3, 3);
      expect(neighbors.length).toBe(2);
      expect(neighbors).toContain(grid[0][1]);
      expect(neighbors).toContain(grid[1][0]);
    });

    it('should get neighbors for an edge cell', () => {
      const neighbors = getNeighbors(grid[1][0], grid, 3, 3);
      expect(neighbors.length).toBe(3);
      expect(neighbors).toContain(grid[0][0]);
      expect(neighbors).toContain(grid[1][1]);
      expect(neighbors).toContain(grid[2][0]);
    });

    it('should get neighbors for a center cell', () => {
      const neighbors = getNeighbors(grid[1][1], grid, 3, 3);
      expect(neighbors.length).toBe(4);
      expect(neighbors).toContain(grid[0][1]);
      expect(neighbors).toContain(grid[1][0]);
      expect(neighbors).toContain(grid[1][2]);
      expect(neighbors).toContain(grid[2][1]);
    });
  });

  describe('getUnvisitedNeighbors', () => {
    it('should only return unvisited neighbors', () => {
      const grid = Array.from({ length: 2 }, (_, y) =>
        Array.from({ length: 2 }, (_, x) => ({
          x, y, walls: { top: true, right: true, bottom: true, left: true }, visited: false
        }))
      );
      grid[0][1].visited = true; // Mark one neighbor as visited
      const neighbors = getUnvisitedNeighbors(grid[0][0], grid, 2, 2);
      expect(neighbors.length).toBe(1);
      expect(neighbors[0]).toBe(grid[1][0]);
    });
  });

  describe('createSeededRandom', () => {
    it('should produce a deterministic sequence of numbers for a given seed', () => {
      const random1 = createSeededRandom(123);
      const random2 = createSeededRandom(123);
      expect(random1()).toBe(random2());
      expect(random1()).toBe(random2());
      expect(random1()).toBe(random2());
    });

    it('should produce different sequences for different seeds', () => {
      const random1 = createSeededRandom(123);
      const random2 = createSeededRandom(456);
      expect(random1()).not.toBe(random2());
    });
  });
});
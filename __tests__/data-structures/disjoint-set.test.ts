import { DisjointSet } from '../../data-structures/disjoint-set';

describe('DisjointSet', () => {
  it('should initialize with each item in its own set', () => {
    const items = ['a', 'b', 'c'];
    const dsu = new DisjointSet(items);
    expect(dsu.connected('a', 'b')).toBe(false);
    expect(dsu.connected('b', 'c')).toBe(false);
    expect(dsu.find('a')).toBe('a');
  });

  it('should connect two items with union', () => {
    const dsu = new DisjointSet(['a', 'b', 'c']);
    dsu.union('a', 'b');
    expect(dsu.connected('a', 'b')).toBe(true);
    expect(dsu.connected('a', 'c')).toBe(false);
  });

  it('should handle transitive connections', () => {
    const dsu = new DisjointSet(['a', 'b', 'c', 'd']);
    dsu.union('a', 'b');
    dsu.union('c', 'd');
    dsu.union('b', 'c');
    expect(dsu.connected('a', 'd')).toBe(true);
  });

  it('should return the same root for all connected items', () => {
    const dsu = new DisjointSet([1, 2, 3, 4]);
    dsu.union(1, 2);
    dsu.union(3, 4);
    dsu.union(1, 4);
    const root = dsu.find(1);
    expect(dsu.find(2)).toBe(root);
    expect(dsu.find(3)).toBe(root);
    expect(dsu.find(4)).toBe(root);
  });
});
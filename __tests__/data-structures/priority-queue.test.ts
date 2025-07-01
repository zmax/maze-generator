import { PriorityQueue } from '../../data-structures/priority-queue';

describe('PriorityQueue', () => {
  it('should be empty initially', () => {
    const pq = new PriorityQueue<string>();
    expect(pq.isEmpty()).toBe(true);
  });

  it('should extract the minimum priority item', () => {
    const pq = new PriorityQueue<string>();
    pq.insert('task C', 30);
    pq.insert('task A', 10);
    pq.insert('task B', 20);
    expect(pq.extractMin()).toBe('task A');
    expect(pq.extractMin()).toBe('task B');
    expect(pq.extractMin()).toBe('task C');
    expect(pq.isEmpty()).toBe(true);
  });

  it('should handle items with the same priority', () => {
    const pq = new PriorityQueue<string>();
    pq.insert('first', 2);
    pq.insert('second', 1);
    pq.insert('third', 2);
    expect(pq.extractMin()).toBe('second');
    // The order for equal priorities is not guaranteed, so we just check they come out
    const remaining = new Set([pq.extractMin(), pq.extractMin()]);
    expect(remaining.has('first')).toBe(true);
    expect(remaining.has('third')).toBe(true);
  });

  it('should return null when extracting from an empty queue', () => {
    const pq = new PriorityQueue<number>();
    expect(pq.extractMin()).toBeNull();
  });

  it('should return all items for getItems without modifying the queue', () => {
    const pq = new PriorityQueue<string>();
    pq.insert('a', 1);
    pq.insert('b', 2);
    const items = pq.getItems();
    expect(items.length).toBe(2);
    expect(items).toContain('a');
    expect(items).toContain('b');
    expect(pq.isEmpty()).toBe(false);
    expect(pq.extractMin()).toBe('a');
  });
});
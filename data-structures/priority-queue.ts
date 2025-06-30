/**
 * 一個使用最小堆實作的優先權佇列，用於 A* 演算法。
 * 優先權越低，越先被取出。
 */
export class PriorityQueue<T> {
  private heap: { item: T; priority: number }[] = [];

  /**
   * 插入一個帶有優先權的項目
   * @param item 要插入的項目
   * @param priority 優先權 (數值越小越高)
   */
  public insert(item: T, priority: number): void {
    this.heap.push({ item, priority });
    this.siftUp(this.heap.length - 1);
  }

  /**
   * 取出並回傳優先權最高的項目 (最小的值)
   * @returns {T | null} 優先權最高的項目，如果佇列為空則回傳 null
   */
  public extractMin(): T | null {
    if (this.isEmpty()) {
      return null;
    }
    this.swap(0, this.heap.length - 1);
    const { item } = this.heap.pop()!;
    if (!this.isEmpty()) {
      this.siftDown(0);
    }
    return item;
  }

  /**
   * 檢查佇列是否為空
   * @returns {boolean} 如果為空則為 true
   */
  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Returns the items in the queue as an array, for visualization purposes.
   * @returns {T[]}
   */
  public getItems(): T[] {
    return this.heap.map(node => node.item);
  }

  private getParentIndex(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private getLeftChildIndex(i: number): number {
    return 2 * i + 1;
  }

  private getRightChildIndex(i: number): number {
    return 2 * i + 2;
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private siftUp(i: number): void {
    let parentIndex = this.getParentIndex(i);
    while (i > 0 && this.heap[i].priority < this.heap[parentIndex].priority) {
      this.swap(i, parentIndex);
      i = parentIndex;
      parentIndex = this.getParentIndex(i);
    }
  }

  private siftDown(i: number): void {
    let minIndex = i;
    const leftIndex = this.getLeftChildIndex(i);
    const rightIndex = this.getRightChildIndex(i);
    const size = this.heap.length;

    if (leftIndex < size && this.heap[leftIndex].priority < this.heap[minIndex].priority) {
      minIndex = leftIndex;
    }

    if (rightIndex < size && this.heap[rightIndex].priority < this.heap[minIndex].priority) {
      minIndex = rightIndex;
    }

    if (i !== minIndex) {
      this.swap(i, minIndex);
      this.siftDown(minIndex);
    }
  }
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriorityQueue = void 0;
/**
 * 一個使用最小堆實作的優先權佇列，用於 A* 演算法。
 * 優先權越低，越先被取出。
 */
class PriorityQueue {
    heap = [];
    /**
     * 插入一個帶有優先權的項目
     * @param item 要插入的項目
     * @param priority 優先權 (數值越小越高)
     */
    insert(item, priority) {
        this.heap.push({ item, priority });
        this.siftUp(this.heap.length - 1);
    }
    /**
     * 取出並回傳優先權最高的項目 (最小的值)
     * @returns {T | null} 優先權最高的項目，如果佇列為空則回傳 null
     */
    extractMin() {
        if (this.isEmpty()) {
            return null;
        }
        this.swap(0, this.heap.length - 1);
        const { item } = this.heap.pop();
        if (!this.isEmpty()) {
            this.siftDown(0);
        }
        return item;
    }
    /**
     * 檢查佇列是否為空
     * @returns {boolean} 如果為空則為 true
     */
    isEmpty() {
        return this.heap.length === 0;
    }
    /**
     * Returns the items in the queue as an array, for visualization purposes.
     * @returns {T[]}
     */
    getItems() {
        return this.heap.map(node => node.item);
    }
    getParentIndex(i) {
        return Math.floor((i - 1) / 2);
    }
    getLeftChildIndex(i) {
        return 2 * i + 1;
    }
    getRightChildIndex(i) {
        return 2 * i + 2;
    }
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
    siftUp(i) {
        let parentIndex = this.getParentIndex(i);
        while (i > 0 && this.heap[i].priority < this.heap[parentIndex].priority) {
            this.swap(i, parentIndex);
            i = parentIndex;
            parentIndex = this.getParentIndex(i);
        }
    }
    siftDown(i) {
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
exports.PriorityQueue = PriorityQueue;

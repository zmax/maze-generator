"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisjointSet = void 0;
/**
 * 並查集 (Disjoint Set Union) 資料結構，用於 Kruskal 演算法。
 * 透過「按秩合併」和「路徑壓縮」進行了最佳化。
 * @template T 集合中元素的類型。
 */
class DisjointSet {
    parent = new Map();
    rank = new Map();
    /**
     * @param items 初始元素陣列，每個元素都會被建立成一個獨立的集合。
     */
    constructor(items = []) {
        items.forEach(item => this.makeSet(item));
    }
    /**
     * 建立一個只包含單一元素的新集合。
     * @param item 要加入的元素。
     */
    makeSet(item) {
        if (!this.parent.has(item)) {
            this.parent.set(item, item);
            this.rank.set(item, 0);
        }
    }
    /**
     * 尋找一個元素的代表元素（根節點），並在過程中進行路徑壓縮。
     * @param item 要尋找的元素。
     * @returns {T} 該元素所在集合的代表元素。
     */
    find(item) {
        const root = this.parent.get(item);
        if (root === item) {
            return item;
        }
        const representative = this.find(root);
        this.parent.set(item, representative); // 路徑壓縮
        return representative;
    }
    /**
     * 合併兩個元素所在的集合。
     * @param item1 第一個元素。
     * @param item2 第二個元素。
     */
    union(item1, item2) {
        const root1 = this.find(item1);
        const root2 = this.find(item2);
        if (root1 !== root2) {
            const rank1 = this.rank.get(root1);
            const rank2 = this.rank.get(root2);
            // 按秩合併
            if (rank1 < rank2) {
                this.parent.set(root1, root2);
            }
            else if (rank1 > rank2) {
                this.parent.set(root2, root1);
            }
            else {
                this.parent.set(root2, root1);
                this.rank.set(root1, rank1 + 1);
            }
        }
    }
    /**
     * 檢查兩個元素是否在同一個集合中。
     * @param item1 第一個元素。
     * @param item2 第二個元素。
     * @returns {boolean} 如果在同一個集合則回傳 true，否則回傳 false。
     */
    connected(item1, item2) {
        return this.find(item1) === this.find(item2);
    }
}
exports.DisjointSet = DisjointSet;

import React from 'react';
import type { MazeGenerationAlgorithm, GrowingTreeStrategy, BinaryTreeBias } from '../../types';

export interface ControlSettings {
  algorithm: MazeGenerationAlgorithm;
  width: number;
  height: number;
  seed: string;
  delay: number;
  rbBias: number;
  gtStrategy: GrowingTreeStrategy;
  btBias: BinaryTreeBias;
}

interface ControlsPanelProps {
  settings: ControlSettings;
  onSettingsChange: (newSettings: ControlSettings) => void;
  onGenerate: () => void;
  onSolve: () => void;
  onStop: () => void;
  isAnimating: boolean;
  isMazeGenerated: boolean;
}

const ALGORITHMS: MazeGenerationAlgorithm[] = ['recursive-backtracker', 'recursive-division', 'prim', 'kruskal', 'wilson', 'growing-tree', 'binary-tree', 'aldous-broder', 'sidewinder'];
const GT_STRATEGIES: GrowingTreeStrategy[] = ['newest', 'random', 'oldest'];
const BT_BIASES: BinaryTreeBias[] = ['north-west', 'north-east', 'south-west', 'south-east'];

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  settings,
  onSettingsChange,
  onGenerate,
  onSolve,
  onStop,
  isAnimating,
  isMazeGenerated,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    onSettingsChange({
      ...settings,
      [name]: isNumber ? Number(value) : value,
    });
  };

  return (
    <div className="controls">
      <h1>迷宮設定</h1>
      <div className="control-group">
        <label htmlFor="algorithm">生成演算法</label>
        <select id="algorithm" name="algorithm" value={settings.algorithm} onChange={handleInputChange} disabled={isAnimating}>
          {ALGORITHMS.map(algo => (
            <option key={algo} value={algo}>
              {algo.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </option>
          ))}
        </select>
      </div>
      <div className="control-group">
        <label htmlFor="width">寬度</label>
        <input type="number" id="width" name="width" value={settings.width} onChange={handleInputChange} min="5" max="200" disabled={isAnimating} />
      </div>
      <div className="control-group">
        <label htmlFor="height">高度</label>
        <input type="number" id="height" name="height" value={settings.height} onChange={handleInputChange} min="5" max="200" disabled={isAnimating} />
      </div>
      <div className="control-group">
        <label htmlFor="seed">隨機種子 (留空則隨機)</label>
        <input type="text" id="seed" name="seed" value={settings.seed} onChange={handleInputChange} disabled={isAnimating} />
      </div>
      <div className="control-group">
        <label htmlFor="delay">動畫延遲 (ms)</label>
        <input type="number" id="delay" name="delay" value={settings.delay} onChange={handleInputChange} min="0" disabled={isAnimating} />
      </div>

      <div className="options-panel">
        <h2>演算法選項</h2>
        {settings.algorithm === 'recursive-backtracker-biased' && (
          <div className="control-group">
            <label htmlFor="rbBias">直線偏好 (0.0 - 1.0)</label>
            <input
              type="number"
              id="rbBias"
              name="rbBias"
              value={settings.rbBias}
              onChange={handleInputChange}
              min="0" max="1" step="0.05"
              disabled={isAnimating}
            />
          </div>
        )}
        {settings.algorithm === 'growing-tree' && (
          <div className="control-group">
            <label htmlFor="gtStrategy">生長樹策略</label>
            <select id="gtStrategy" name="gtStrategy" value={settings.gtStrategy} onChange={handleInputChange} disabled={isAnimating}>
              {GT_STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
        {settings.algorithm === 'binary-tree' && (
          <div className="control-group">
            <label htmlFor="btBias">二元樹偏好</label>
            <select id="btBias" name="btBias" value={settings.btBias} onChange={handleInputChange} disabled={isAnimating}>
              {BT_BIASES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="button-group" style={{ marginTop: 'auto' }}>
        <button onClick={onGenerate} disabled={isAnimating}>
          產生迷宮
        </button>
        <button onClick={onSolve} disabled={isAnimating || !isMazeGenerated}>
          求解迷宮
        </button>
        <button onClick={onStop} disabled={!isAnimating} style={{ backgroundColor: '#f5222d' }}>
          停止動畫
        </button>
      </div>
    </div>
  );
};
export type AlgorithmStep = {
  type: 'compare' | 'swap' | 'markSorted' | 'highlight' | 'unhighlight' | 'pivot' | 'merge' | 'reset' | 
        'insertNode' | 'deleteNode' | 'traverseNode' | 'rotateTree' | 'visitNode' | 'queueNode' | 'stackNode' | 'exploreEdge';
  indices?: number[];
  values?: number[];
  nodeId?: string;
  from?: string;
  to?: string;
  value?: number;
  rotation?: 'LL' | 'LR' | 'RL' | 'RR';
  description: string;
  data?: any;
};

export type AlgorithmState = {
  array: number[];
  currentStep: number;
  isPlaying: boolean;
  isPaused: boolean;
  speed: number;
  steps: AlgorithmStep[];
  sortedIndices: Set<number>;
  compareIndices: Set<number>;
  highlightIndices: Set<number>;
  pivotIndex?: number;
};

export type AlgorithmType = 'bubble' | 'merge' | 'quick' | 'heap' | 'bst' | 'bfs' | 'dfs';

export type ViewMode = 'simple' | 'technical';

export type TreeNode = {
  id: string;
  value: number;
  x: number;
  y: number;
  left?: TreeNode;
  right?: TreeNode;
  highlighted?: boolean;
};

export type GraphNode = {
  id: string;
  value: string;
  x: number;
  y: number;
  visited?: boolean;
  highlighted?: boolean;
};

export type GraphEdge = {
  from: string;
  to: string;
  highlighted?: boolean;
};
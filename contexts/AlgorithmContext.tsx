"use client";

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { AlgorithmState, AlgorithmStep, AlgorithmType, ViewMode, TreeNode, GraphNode, GraphEdge } from '@/types/algorithm';

type AlgorithmAction =
  | { type: 'SET_ALGORITHM'; algorithm: AlgorithmType }
  | { type: 'SET_ARRAY'; array: number[] }
  | { type: 'SET_STEPS'; steps: AlgorithmStep[] }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'SET_SPEED'; speed: number }
  | { type: 'SET_VIEW_MODE'; mode: ViewMode }
  | { type: 'UPDATE_STATE'; updates: Partial<AlgorithmState> }
  | { type: 'SET_TREE'; tree: TreeNode | null }
  | { type: 'SET_GRAPH'; nodes: GraphNode[]; edges: GraphEdge[] };

const initialState: AlgorithmState & { 
  algorithm: AlgorithmType; 
  viewMode: ViewMode;
  tree: TreeNode | null;
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  visitedNodes: Set<string>;
  queue: string[];
  stack: string[];
} = {
  algorithm: 'bubble',
  viewMode: 'simple',
  array: [64, 34, 25, 12, 22, 11, 90],
  currentStep: -1,
  isPlaying: false,
  isPaused: false,
  speed: 1000,
  steps: [],
  sortedIndices: new Set(),
  compareIndices: new Set(),
  highlightIndices: new Set(),
  tree: null,
  graphNodes: [],
  graphEdges: [],
  visitedNodes: new Set(),
  queue: [],
  stack: [],
};

const algorithmReducer = (state: typeof initialState, action: AlgorithmAction): typeof initialState => {
  switch (action.type) {
    case 'SET_ALGORITHM':
      return { ...state, algorithm: action.algorithm, currentStep: -1, steps: [], isPlaying: false };
    case 'SET_ARRAY':
      return { 
        ...state, 
        array: action.array, 
        currentStep: -1, 
        steps: [], 
        sortedIndices: new Set(),
        compareIndices: new Set(),
        highlightIndices: new Set()
      };
    case 'SET_STEPS':
      return { ...state, steps: action.steps, currentStep: -1 };
    case 'NEXT_STEP':
      if (state.currentStep < state.steps.length - 1) {
        const nextStep = state.currentStep + 1;
        return applyStep(state, nextStep);
      }
      return { ...state, isPlaying: false };
    case 'PREV_STEP':
      if (state.currentStep > -1) {
        const prevStep = state.currentStep - 1;
        return resetToStep(state, prevStep);
      }
      return state;
    case 'PLAY':
      return { ...state, isPlaying: true, isPaused: false };
    case 'PAUSE':
      return { ...state, isPlaying: false, isPaused: true };
    case 'RESET':
      return { 
        ...state, 
        currentStep: -1, 
        isPlaying: false, 
        isPaused: false,
        sortedIndices: new Set(),
        compareIndices: new Set(),
        highlightIndices: new Set(),
        pivotIndex: undefined,
        visitedNodes: new Set(),
        queue: [],
        stack: [],
        array: state.algorithm === 'bubble' || state.algorithm === 'merge' || 
               state.algorithm === 'quick' || state.algorithm === 'heap' 
               ? [64, 34, 25, 12, 22, 11, 90] : state.array
      };
    case 'SET_SPEED':
      return { ...state, speed: action.speed };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.mode };
    case 'UPDATE_STATE':
      return { ...state, ...action.updates };
    case 'SET_TREE':
      return { ...state, tree: action.tree };
    case 'SET_GRAPH':
      return { ...state, graphNodes: action.nodes, graphEdges: action.edges };
    default:
      return state;
  }
};

const applyStep = (state: typeof initialState, stepIndex: number): typeof initialState => {
  if (stepIndex >= state.steps.length) return state;
  
  const step = state.steps[stepIndex];
  const newState = { ...state, currentStep: stepIndex };
  
  // Reset previous step effects
  newState.compareIndices = new Set();
  newState.highlightIndices = new Set();
  
  switch (step.type) {
    case 'compare':
      if (step.indices) {
        newState.compareIndices = new Set(step.indices);
      }
      break;
    case 'swap':
      if (step.indices && step.indices.length === 2) {
        const [i, j] = step.indices;
        const newArray = [...newState.array];
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        newState.array = newArray;
      }
      break;
    case 'markSorted':
      if (step.indices) {
        const newSorted = new Set(newState.sortedIndices);
        step.indices.forEach(i => newSorted.add(i));
        newState.sortedIndices = newSorted;
      }
      break;
    case 'highlight':
      if (step.indices) {
        newState.highlightIndices = new Set(step.indices);
      }
      break;
    case 'pivot':
      if (step.indices && step.indices.length > 0) {
        newState.pivotIndex = step.indices[0];
      }
      break;
    case 'merge':
      if (step.values) {
        newState.array = [...step.values];
      }
      break;
    case 'visitNode':
      if (step.nodeId) {
        const newVisited = new Set(newState.visitedNodes);
        newVisited.add(step.nodeId);
        newState.visitedNodes = newVisited;
      }
      break;
    case 'queueNode':
      if (step.nodeId) {
        newState.queue = [...newState.queue, step.nodeId];
      }
      break;
    case 'stackNode':
      if (step.nodeId) {
        newState.stack = [...newState.stack, step.nodeId];
      }
      break;
  }
  
  return newState;
};

const resetToStep = (state: typeof initialState, stepIndex: number): typeof initialState => {
  // Reset to initial state and replay all steps up to stepIndex
  let newState = {
    ...state,
    currentStep: -1,
    sortedIndices: new Set(),
    compareIndices: new Set(),
    highlightIndices: new Set(),
    pivotIndex: undefined,
    visitedNodes: new Set(),
    queue: [],
    stack: [],
  };
  
  // Restore original array
  if (state.algorithm === 'bubble' || state.algorithm === 'merge' || 
      state.algorithm === 'quick' || state.algorithm === 'heap') {
    newState.array = [64, 34, 25, 12, 22, 11, 90];
  }
  
  // Replay steps
  for (let i = 0; i <= stepIndex; i++) {
    newState = applyStep(newState, i);
  }
  
  return newState;
};

const AlgorithmContext = createContext<{
  state: typeof initialState;
  dispatch: React.Dispatch<AlgorithmAction>;
  generateSteps: (algorithm: AlgorithmType, array: number[]) => void;
} | undefined>(undefined);

export const AlgorithmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(algorithmReducer, initialState);

  const generateSteps = useCallback((algorithm: AlgorithmType, array: number[]) => {
    let steps: AlgorithmStep[] = [];
    
    switch (algorithm) {
      case 'bubble':
        steps = generateBubbleSortSteps([...array]);
        break;
      case 'merge':
        steps = generateMergeSortSteps([...array]);
        break;
      case 'quick':
        steps = generateQuickSortSteps([...array]);
        break;
      case 'heap':
        steps = generateHeapSortSteps([...array]);
        break;
      case 'bst':
        steps = generateBSTSteps();
        break;
      case 'bfs':
        steps = generateBFSSteps();
        break;
      case 'dfs':
        steps = generateDFSSteps();
        break;
      default:
        steps = [];
    }
    
    dispatch({ type: 'SET_STEPS', steps });
  }, []);

  return (
    <AlgorithmContext.Provider value={{ state, dispatch, generateSteps }}>
      {children}
    </AlgorithmContext.Provider>
  );
};

export const useAlgorithm = () => {
  const context = useContext(AlgorithmContext);
  if (!context) {
    throw new Error('useAlgorithm must be used within an AlgorithmProvider');
  }
  return context;
};

// Algorithm step generators
const generateBubbleSortSteps = (array: number[]): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  const n = array.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        type: 'compare',
        indices: [j, j + 1],
        description: `Compare ${array[j]} and ${array[j + 1]}`
      });

      if (array[j] > array[j + 1]) {
        steps.push({
          type: 'swap',
          indices: [j, j + 1],
          description: `Swap ${array[j]} and ${array[j + 1]}`
        });
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
      }
    }
    steps.push({
      type: 'markSorted',
      indices: [n - 1 - i],
      description: `Mark ${array[n - 1 - i]} as sorted`
    });
  }
  steps.push({
    type: 'markSorted',
    indices: [0],
    description: `Mark ${array[0]} as sorted`
  });

  return steps;
};

const generateMergeSortSteps = (array: number[]): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  
  const mergeSort = (arr: number[], left: number, right: number) => {
    if (left >= right) return;
    
    const mid = Math.floor((left + right) / 2);
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    merge(arr, left, mid, right);
  };
  
  const merge = (arr: number[], left: number, mid: number, right: number) => {
    const temp = [];
    let i = left, j = mid + 1;
    
    while (i <= mid && j <= right) {
      steps.push({
        type: 'compare',
        indices: [i, j],
        description: `Compare ${arr[i]} and ${arr[j]}`
      });
      
      if (arr[i] <= arr[j]) {
        temp.push(arr[i++]);
      } else {
        temp.push(arr[j++]);
      }
    }
    
    while (i <= mid) temp.push(arr[i++]);
    while (j <= right) temp.push(arr[j++]);
    
    for (let k = 0; k < temp.length; k++) {
      arr[left + k] = temp[k];
    }
    
    steps.push({
      type: 'merge',
      indices: Array.from({length: right - left + 1}, (_, i) => left + i),
      values: [...arr],
      description: `Merge segments`
    });
  };
  
  mergeSort([...array], 0, array.length - 1);
  return steps;
};

const generateQuickSortSteps = (array: number[]): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  
  const quickSort = (arr: number[], low: number, high: number) => {
    if (low < high) {
      const pi = partition(arr, low, high);
      quickSort(arr, low, pi - 1);
      quickSort(arr, pi + 1, high);
    }
  };
  
  const partition = (arr: number[], low: number, high: number): number => {
    const pivot = arr[high];
    steps.push({
      type: 'pivot',
      indices: [high],
      description: `Select ${pivot} as pivot`
    });
    
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      steps.push({
        type: 'compare',
        indices: [j, high],
        description: `Compare ${arr[j]} with pivot ${pivot}`
      });
      
      if (arr[j] < pivot) {
        i++;
        if (i !== j) {
          steps.push({
            type: 'swap',
            indices: [i, j],
            description: `Swap ${arr[i]} and ${arr[j]}`
          });
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }
    }
    
    steps.push({
      type: 'swap',
      indices: [i + 1, high],
      description: `Place pivot ${pivot} in correct position`
    });
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    
    return i + 1;
  };
  
  quickSort([...array], 0, array.length - 1);
  return steps;
};

const generateHeapSortSteps = (array: number[]): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  const n = array.length;
  
  const heapify = (arr: number[], n: number, i: number) => {
    let largest = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;
    
    if (left < n) {
      steps.push({
        type: 'compare',
        indices: [left, largest],
        description: `Compare ${arr[left]} and ${arr[largest]}`
      });
      if (arr[left] > arr[largest]) largest = left;
    }
    
    if (right < n) {
      steps.push({
        type: 'compare',
        indices: [right, largest],
        description: `Compare ${arr[right]} and ${arr[largest]}`
      });
      if (arr[right] > arr[largest]) largest = right;
    }
    
    if (largest !== i) {
      steps.push({
        type: 'swap',
        indices: [i, largest],
        description: `Swap ${arr[i]} and ${arr[largest]}`
      });
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      heapify(arr, n, largest);
    }
  };
  
  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(array, n, i);
  }
  
  // Extract elements from heap
  for (let i = n - 1; i > 0; i--) {
    steps.push({
      type: 'swap',
      indices: [0, i],
      description: `Move ${array[0]} to sorted position`
    });
    [array[0], array[i]] = [array[i], array[0]];
    
    steps.push({
      type: 'markSorted',
      indices: [i],
      description: `Mark ${array[i]} as sorted`
    });
    
    heapify(array, i, 0);
  }
  
  steps.push({
    type: 'markSorted',
    indices: [0],
    description: `Mark ${array[0]} as sorted`
  });
  
  return steps;
};

// Tree algorithm step generators
const generateBSTSteps = (): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  
  // Sample BST insertion sequence
  const values = [50, 30, 70, 20, 40, 60, 80];
  
  values.forEach((value, index) => {
    steps.push({
      type: 'insertNode',
      nodeId: `node-${index}`,
      value: value,
      description: `Insert ${value} into BST`
    });
  });
  
  // Add traversal steps
  steps.push({
    type: 'traverseNode',
    nodeId: 'node-3',
    description: 'Start inorder traversal at node 20'
  });
  
  steps.push({
    type: 'traverseNode',
    nodeId: 'node-1',
    description: 'Visit node 30'
  });
  
  steps.push({
    type: 'traverseNode',
    nodeId: 'node-4',
    description: 'Visit node 40'
  });
  
  steps.push({
    type: 'traverseNode',
    nodeId: 'node-0',
    description: 'Visit root node 50'
  });
  
  return steps;
};

// Graph algorithm step generators
const generateBFSSteps = (): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  
  // Sample BFS traversal
  steps.push({
    type: 'visitNode',
    nodeId: 'A',
    description: 'Start BFS at node A'
  });
  
  steps.push({
    type: 'queueNode',
    nodeId: 'B',
    description: 'Add B to queue'
  });
  
  steps.push({
    type: 'queueNode',
    nodeId: 'D',
    description: 'Add D to queue'
  });
  
  steps.push({
    type: 'exploreEdge',
    from: 'A',
    to: 'B',
    description: 'Explore edge A → B'
  });
  
  steps.push({
    type: 'visitNode',
    nodeId: 'B',
    description: 'Visit node B'
  });
  
  steps.push({
    type: 'queueNode',
    nodeId: 'C',
    description: 'Add C to queue'
  });
  
  steps.push({
    type: 'queueNode',
    nodeId: 'E',
    description: 'Add E to queue'
  });
  
  steps.push({
    type: 'exploreEdge',
    from: 'A',
    to: 'D',
    description: 'Explore edge A → D'
  });
  
  steps.push({
    type: 'visitNode',
    nodeId: 'D',
    description: 'Visit node D'
  });
  
  steps.push({
    type: 'exploreEdge',
    from: 'B',
    to: 'C',
    description: 'Explore edge B → C'
  });
  
  steps.push({
    type: 'visitNode',
    nodeId: 'C',
    description: 'Visit node C'
  });
  
  steps.push({
    type: 'queueNode',
    nodeId: 'F',
    description: 'Add F to queue'
  });
  
  steps.push({
    type: 'exploreEdge',
    from: 'B',
    to: 'E',
    description: 'Explore edge B → E'
  });
  
  steps.push({
    type: 'visitNode',
    nodeId: 'E',
    description: 'Visit node E'
  });
  
  steps.push({
    type: 'exploreEdge',
    from: 'C',
    to: 'F',
    description: 'Explore edge C → F'
  });
  
  steps.push({
    type: 'visitNode',
    nodeId: 'F',
    description: 'Visit node F'
  });
  
  return steps;
};

const generateDFSSteps = (): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  
  // Sample DFS traversal
  steps.push({
    type: 'visitNode',
    nodeId: 'A',
    description: 'Start DFS at node A'
  });
  
  steps.push({
    type: 'stackNode',
    nodeId: 'B',
    description: 'Push B to stack'
  });
  
  steps.push({
    type: 'stackNode',
    nodeId: 'D',
    description: 'Push D to stack'
  });
  
  steps.push({
    type: 'exploreEdge',
    from: 'A',
    to: 'B',
    description: 'Explore edge A → B'
  });
  
  steps.push({
    type: 'visitNode',
    nodeId: 'B',
    description: 'Visit node B'
  });
  
  steps.push({
    type: 'stackNode',
    nodeId: 'C',
    description: 'Push C to stack'
  });
  
  steps.push({
    type: 'stackNode',
    nodeId: 'E',
    description: 'Push E to stack'
  });
  
  steps.push({
    type: 'exploreEdge',
    from: 'B',
    to: 'C',
    description: 'Explore edge B → C'
  });
  
  steps.push({
    type: 'visitNode',
    nodeId: 'C',
    description: 'Visit node C'
  });
  
  steps.push({
    type: 'stackNode',
    nodeId: 'F',
    description: 'Push F to stack'
  });
  
  steps.push({
    type: 'exploreEdge',
    from: 'C',
    to: 'F',
    description: 'Explore edge C → F'
  });
  
  steps.push({
    type: 'visitNode',
    nodeId: 'F',
    description: 'Visit node F'
  });
  
  steps.push({
    type: 'exploreEdge',
    from: 'B',
    to: 'E',
    description: 'Explore edge B → E'
  });
  
  steps.push({
    type: 'visitNode',
    nodeId: 'E',
    description: 'Visit node E'
  });
  
  steps.push({
    type: 'exploreEdge',
    from: 'A',
    to: 'D',
    description: 'Explore edge A → D'
  });
  
  steps.push({
    type: 'visitNode',
    nodeId: 'D',
    description: 'Visit node D'
  });
  
  return steps;
};
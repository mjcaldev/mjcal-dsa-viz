"use client";

import React from 'react';
import { useAlgorithm } from '@/contexts/AlgorithmContext';
import { AlgorithmType } from '@/types/algorithm';
import { ChartBar as BarChart3, GitBranch, Network, ChevronRight } from 'lucide-react';

const algorithmCategories = [
  {
    title: 'Sorting Algorithms',
    icon: BarChart3,
    algorithms: [
      { key: 'bubble' as AlgorithmType, name: 'Bubble Sort', complexity: 'O(n²)' },
      { key: 'merge' as AlgorithmType, name: 'Merge Sort', complexity: 'O(n log n)' },
      { key: 'quick' as AlgorithmType, name: 'Quick Sort', complexity: 'O(n log n)' },
      { key: 'heap' as AlgorithmType, name: 'Heap Sort', complexity: 'O(n log n)' },
    ]
  },
  {
    title: 'Tree Algorithms',
    icon: GitBranch,
    algorithms: [
      { key: 'bst' as AlgorithmType, name: 'Binary Search Tree', complexity: 'O(log n)' },
    ]
  },
  {
    title: 'Graph Algorithms',
    icon: Network,
    algorithms: [
      { key: 'bfs' as AlgorithmType, name: 'Breadth-First Search', complexity: 'O(V + E)' },
      { key: 'dfs' as AlgorithmType, name: 'Depth-First Search', complexity: 'O(V + E)' },
    ]
  },
];

export const Sidebar: React.FC = () => {
  const { state, dispatch } = useAlgorithm();

  const handleAlgorithmSelect = (algorithm: AlgorithmType) => {
    dispatch({ type: 'SET_ALGORITHM', algorithm });
  };

  return (
    <div className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 overflow-y-auto flex-shrink-0">
      <div className="p-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
          DSA Visualizer
        </h1>
        <p className="text-xs lg:text-sm text-gray-600 mb-4 lg:mb-8">
          Interactive algorithm visualization with step-by-step animations
        </p>

        <div className="space-y-4 lg:space-y-6">
          {algorithmCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-1 lg:space-y-2">
              <div className="flex items-center space-x-2 text-xs lg:text-sm font-semibold text-gray-700 mb-2 lg:mb-3">
                <category.icon className="h-4 w-4" />
                <span>{category.title}</span>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:space-y-1 lg:block">
                {category.algorithms.map((algorithm) => (
                  <button
                    key={algorithm.key}
                    onClick={() => handleAlgorithmSelect(algorithm.key)}
                    className={`w-full text-left p-2 lg:p-3 rounded-lg transition-all duration-200 group ${
                      state.algorithm === algorithm.key
                        ? 'bg-blue-50 border border-blue-200 text-blue-900'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-xs lg:text-sm">
                            {algorithm.name}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 hidden lg:block">
                          {algorithm.complexity}
                        </div>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 transition-transform duration-200 ${
                          state.algorithm === algorithm.key 
                            ? 'rotate-90 text-blue-600' 
                            : 'text-gray-400 group-hover:text-gray-600'
                        } hidden lg:block`} 
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
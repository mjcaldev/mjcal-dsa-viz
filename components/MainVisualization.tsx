"use client";

import React from 'react';
import { useAlgorithm } from '@/contexts/AlgorithmContext';
import { SortingVisualization } from './visualizations/SortingVisualization';
import { BSTVisualization } from './visualizations/BSTVisualization';
import { GraphVisualization } from './visualizations/GraphVisualization';

export const MainVisualization: React.FC = () => {
  const { state } = useAlgorithm();

  const renderVisualization = () => {
    switch (state.algorithm) {
      case 'bubble':
      case 'merge':
      case 'quick':
      case 'heap':
        return <SortingVisualization />;
      case 'bst':
        return <BSTVisualization />;
      case 'bfs':
      case 'dfs':
        return <GraphVisualization />;
      default:
        return <SortingVisualization />;
    }
  };

  return (
    <div className="flex-1 p-3 lg:p-6 bg-gray-50 overflow-y-auto">
      <div className="w-full max-w-none lg:max-w-6xl lg:mx-0">
        {renderVisualization()}
      </div>
    </div>
  );
};
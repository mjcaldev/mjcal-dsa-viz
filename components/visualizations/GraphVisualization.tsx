"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlgorithm } from '@/contexts/AlgorithmContext';
import { GraphNode, GraphEdge } from '@/types/algorithm';
import { Button } from '@/components/ui/button';

interface GraphVisualizationProps {
  className?: string;
}

export const GraphVisualization: React.FC<GraphVisualizationProps> = ({ className }) => {
  const { state, dispatch } = useAlgorithm();
  const [visitedNodes, setVisitedNodes] = useState<Set<string>>(new Set());
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [highlightedEdges, setHighlightedEdges] = useState<Set<string>>(new Set());
  const [queue, setQueue] = useState<string[]>([]);
  const [stack, setStack] = useState<string[]>([]);

  // Sample graph for demonstration
  const nodes: GraphNode[] = [
    { id: 'A', value: 'A', x: 150, y: 100 },
    { id: 'B', value: 'B', x: 300, y: 100 },
    { id: 'C', value: 'C', x: 450, y: 100 },
    { id: 'D', value: 'D', x: 150, y: 250 },
    { id: 'E', value: 'E', x: 300, y: 250 },
    { id: 'F', value: 'F', x: 450, y: 250 },
  ];

  const edges: GraphEdge[] = [
    { from: 'A', to: 'B' },
    { from: 'A', to: 'D' },
    { from: 'B', to: 'C' },
    { from: 'B', to: 'E' },
    { from: 'C', to: 'F' },
    { from: 'D', to: 'E' },
    { from: 'E', to: 'F' },
  ];

  // Auto-play logic for graph traversals
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state.isPlaying && state.currentStep < state.steps.length - 1) {
      interval = setInterval(() => {
        dispatch({ type: 'NEXT_STEP' });
      }, state.speed);
    } else if (state.isPlaying && state.currentStep >= state.steps.length - 1) {
      dispatch({ type: 'PAUSE' });
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isPlaying, state.currentStep, state.steps.length, state.speed, dispatch]);

  // Apply graph traversal step effects
  useEffect(() => {
    if (state.currentStep >= 0 && state.steps[state.currentStep]) {
      const step = state.steps[state.currentStep];
      
      switch (step.type) {
        case 'visitNode':
          if (step.nodeId) {
            setVisitedNodes(prev => new Set([...prev, step.nodeId!]));
            setHighlightedNodes(new Set([step.nodeId]));
            setTimeout(() => {
              setHighlightedNodes(new Set());
            }, state.speed * 0.7);
          }
          break;
        case 'queueNode':
          if (step.nodeId) {
            setQueue(prev => [...prev, step.nodeId!]);
          }
          break;
        case 'stackNode':
          if (step.nodeId) {
            setStack(prev => [...prev, step.nodeId!]);
          }
          break;
        case 'exploreEdge':
          if (step.from && step.to) {
            const edgeKey = `${step.from}-${step.to}`;
            setHighlightedEdges(new Set([edgeKey]));
            setTimeout(() => {
              setHighlightedEdges(new Set());
            }, state.speed * 0.8);
          }
          break;
      }
    }
  }, [state.currentStep, state.steps, state.speed]);

  // Reset graph state when algorithm changes or resets
  useEffect(() => {
    if (state.currentStep === -1) {
      setVisitedNodes(new Set());
      setHighlightedNodes(new Set());
      setHighlightedEdges(new Set());
      setQueue([]);
      setStack([]);
    }
  }, [state.currentStep, state.algorithm]);

  const getNodeById = (id: string) => nodes.find(node => node.id === id);

  const getNodeColor = (nodeId: string) => {
    if (highlightedNodes.has(nodeId)) return '#F59E0B'; // amber - currently exploring
    if (visitedNodes.has(nodeId)) return '#10B981'; // green - visited
    return '#3B82F6'; // blue - unvisited
  };

  const isEdgeHighlighted = (from: string, to: string) => {
    return highlightedEdges.has(`${from}-${to}`) || highlightedEdges.has(`${to}-${from}`);
  };

  const handleReset = () => {
    setVisitedNodes(new Set());
    setHighlightedNodes(new Set());
    setHighlightedEdges(new Set());
    setQueue([]);
    setStack([]);
    dispatch({ type: 'RESET' });
  };

  const handleClearGraph = () => {
    setVisitedNodes(new Set());
    setHighlightedNodes(new Set());
    setHighlightedEdges(new Set());
    setQueue([]);
    setStack([]);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 lg:p-8 ${className}`}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 lg:mb-6 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
            {state.algorithm === 'bfs' ? 'Breadth-First Search' : 'Depth-First Search'}
          </h2>
          <p className="text-sm lg:text-base text-gray-600 mt-1">
            Visualize {state.algorithm.toUpperCase()} algorithm with step-by-step node exploration
          </p>
        </div>
        
        {state.viewMode === 'technical' && (
          <div className="bg-gray-50 rounded-lg p-3 lg:p-4 text-xs lg:text-sm w-full lg:w-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4">
              <div>
                <span className="font-medium text-gray-700">Time Complexity:</span>
                <div className="mt-1">O(V + E)</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Space Complexity:</span>
                <div className="mt-1">O(V)</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Main graph visualization */}
        <div className="flex-1">
          <svg
            width="100%"
            height="300"
            className="border border-gray-100 rounded-lg bg-gray-50"
            viewBox="0 0 500 300"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Render edges */}
            {edges.map((edge, index) => {
              const fromNode = getNodeById(edge.from);
              const toNode = getNodeById(edge.to);
              
              if (!fromNode || !toNode) return null;

              const isHighlighted = isEdgeHighlighted(edge.from, edge.to);

              return (
                <motion.line
                  key={`edge-${index}`}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={isHighlighted ? '#F59E0B' : '#CBD5E1'}
                  strokeWidth={isHighlighted ? 4 : 2}
                  initial={{ pathLength: 0 }}
                  animate={{ 
                    pathLength: 1,
                    stroke: isHighlighted ? '#F59E0B' : '#CBD5E1',
                    strokeWidth: isHighlighted ? 4 : 2
                  }}
                  transition={{ duration: 0.5 }}
                />
              );
            })}

            {/* Render nodes */}
            <AnimatePresence>
              {nodes.map((node) => {
                const isHighlighted = highlightedNodes.has(node.id);
                const isVisited = visitedNodes.has(node.id);

                return (
                  <motion.g key={node.id}>
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r={20}
                      fill={getNodeColor(node.id)}
                      stroke="#1E40AF"
                      strokeWidth={2}
                      initial={{ scale: 0 }}
                      animate={{ 
                        scale: isHighlighted ? 1.2 : 1,
                        fill: getNodeColor(node.id)
                      }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 20,
                        duration: 0.3
                      }}
                    />
                    <motion.text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      fontSize="14"
                      fontWeight="600"
                      animate={{
                        scale: isHighlighted ? 1.1 : 1
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {node.value}
                    </motion.text>
                    
                    {/* Pulse effect for currently exploring node */}
                    {isHighlighted && (
                      <motion.circle
                        cx={node.x}
                        cy={node.y}
                        r={25}
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth={3}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.3, opacity: [0, 1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </svg>
        </div>

        {/* Queue/Stack visualization */}
        <div className="w-full lg:w-48 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 lg:p-4">
            <h3 className="font-semibold text-gray-700 mb-2 lg:mb-3 text-sm lg:text-base">
              {state.algorithm === 'bfs' ? 'Queue' : 'Stack'}
            </h3>
            <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-x-visible">
              <AnimatePresence>
                {(state.algorithm === 'bfs' ? queue : stack).map((nodeId, index) => (
                  <motion.div
                    key={`${nodeId}-${index}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-blue-100 text-blue-800 px-2 lg:px-3 py-1 lg:py-2 rounded text-center font-medium text-sm whitespace-nowrap"
                  >
                    {nodeId}
                  </motion.div>
                ))}
              </AnimatePresence>
              {(state.algorithm === 'bfs' ? queue : stack).length === 0 && (
                <div className="text-gray-400 text-center py-2 lg:py-4 text-xs lg:text-sm whitespace-nowrap">
                  {state.algorithm === 'bfs' ? 'Queue empty' : 'Stack empty'}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 lg:p-4">
            <h3 className="font-semibold text-gray-700 mb-2 lg:mb-3 text-sm lg:text-base">Visited</h3>
            <div className="flex flex-wrap gap-1">
              <AnimatePresence>
                {Array.from(visitedNodes).map((nodeId) => (
                  <motion.span
                    key={nodeId}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs lg:text-sm font-medium"
                  >
                    {nodeId}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 lg:mt-6 flex flex-wrap gap-2 lg:gap-4 justify-center">
        <Button
          onClick={handleReset}
          variant="outline"
          className="px-3 lg:px-4 py-2 text-sm"
        >
          <span className="hidden sm:inline">Reset Algorithm</span>
          <span className="sm:hidden">Reset</span>
        </Button>
        <Button
          onClick={handleClearGraph}
          variant="outline"
          className="px-3 lg:px-4 py-2 text-sm"
        >
          <span className="hidden sm:inline">Clear Graph</span>
          <span className="sm:hidden">Clear</span>
        </Button>
      </div>

      {/* Legend */}
      <div className="mt-4 lg:mt-6 flex flex-wrap justify-center gap-2 lg:gap-4 text-xs lg:text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span className="text-gray-600">Unvisited</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
          <span className="text-gray-600">Exploring</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">Visited</span>
        </div>
      </div>
    </div>
  );
};
"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlgorithm } from '@/contexts/AlgorithmContext';
import { TreeNode } from '@/types/algorithm';
import { Button } from '@/components/ui/button';

interface BSTVisualizationProps {
  className?: string;
}

export const BSTVisualization: React.FC<BSTVisualizationProps> = ({ className }) => {
  const { state, dispatch } = useAlgorithm();
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [insertedNodes, setInsertedNodes] = useState<Set<string>>(new Set());

  // Auto-play logic for BST operations
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

  // Apply BST step effects
  useEffect(() => {
    if (state.currentStep >= 0 && state.steps[state.currentStep]) {
      const step = state.steps[state.currentStep];
      
      switch (step.type) {
        case 'insertNode':
          if (step.nodeId && step.value !== undefined) {
            const newNode = createBSTNode(step.nodeId, step.value);
            setTree(prevTree => insertNodeIntoTree(prevTree, newNode));
            setInsertedNodes(prev => new Set([...prev, step.nodeId!]));
          }
          break;
        case 'traverseNode':
          if (step.nodeId) {
            setHighlightedNodes(new Set([step.nodeId]));
            setTimeout(() => {
              setHighlightedNodes(new Set());
            }, state.speed * 0.8);
          }
          break;
        case 'deleteNode':
          if (step.nodeId) {
            setTree(prevTree => deleteNodeFromTree(prevTree, step.nodeId!));
            setInsertedNodes(prev => {
              const newSet = new Set(prev);
              newSet.delete(step.nodeId!);
              return newSet;
            });
          }
          break;
      }
    }
  }, [state.currentStep, state.steps, state.speed]);

  // Reset tree when algorithm changes or resets
  useEffect(() => {
    if (state.currentStep === -1) {
      setTree(null);
      setHighlightedNodes(new Set());
      setInsertedNodes(new Set());
    }
  }, [state.currentStep, state.algorithm]);

  const createBSTNode = (id: string, value: number): TreeNode => {
    return {
      id,
      value,
      x: 400, // Will be repositioned
      y: 100,
    };
  };

  const insertNodeIntoTree = (root: TreeNode | null, newNode: TreeNode): TreeNode => {
    if (!root) {
      return { ...newNode, x: 400, y: 100 };
    }

    const insertRecursive = (node: TreeNode, depth: number = 0): TreeNode => {
      if (newNode.value < node.value) {
        if (node.left) {
          return { ...node, left: insertRecursive(node.left, depth + 1) };
        } else {
          const leftX = node.x - (200 / Math.pow(2, depth));
          const leftY = node.y + 80;
          return { 
            ...node, 
            left: { ...newNode, x: leftX, y: leftY }
          };
        }
      } else {
        if (node.right) {
          return { ...node, right: insertRecursive(node.right, depth + 1) };
        } else {
          const rightX = node.x + (200 / Math.pow(2, depth));
          const rightY = node.y + 80;
          return { 
            ...node, 
            right: { ...newNode, x: rightX, y: rightY }
          };
        }
      }
    };

    return insertRecursive(root);
  };

  const deleteNodeFromTree = (root: TreeNode | null, nodeId: string): TreeNode | null => {
    if (!root) return null;

    if (root.id === nodeId) {
      // Handle deletion cases
      if (!root.left && !root.right) return null;
      if (!root.left) return root.right;
      if (!root.right) return root.left;
      
      // Find inorder successor
      let successor = root.right;
      while (successor.left) {
        successor = successor.left;
      }
      
      return {
        ...root,
        value: successor.value,
        right: deleteNodeFromTree(root.right, successor.id)
      };
    }

    return {
      ...root,
      left: deleteNodeFromTree(root.left, nodeId),
      right: deleteNodeFromTree(root.right, nodeId)
    };
  };

  const renderTree = (node: TreeNode | undefined, parentX?: number, parentY?: number): React.ReactNode => {
    if (!node) return null;

    const isHighlighted = highlightedNodes.has(node.id);
    const isInserted = insertedNodes.has(node.id);

    return (
      <React.Fragment key={node.id}>
        {/* Edge to parent */}
        {parentX !== undefined && parentY !== undefined && (
          <motion.line
            x1={parentX}
            y1={parentY}
            x2={node.x}
            y2={node.y}
            stroke="#CBD5E1"
            strokeWidth={2}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        )}
        
        {/* Node */}
        <AnimatePresence>
          {isInserted && (
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                x: node.x,
                y: node.y
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20,
                duration: 0.6
              }}
            >
              <motion.circle
                cx={0}
                cy={0}
                r={25}
                fill={isHighlighted ? '#F59E0B' : '#3B82F6'}
                stroke="#1E40AF"
                strokeWidth={2}
                animate={{
                  fill: isHighlighted ? '#F59E0B' : '#3B82F6',
                  scale: isHighlighted ? 1.2 : 1
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.text
                x={0}
                y={0}
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
              
              {/* Highlight ring for traversal */}
              {isHighlighted && (
                <motion.circle
                  cx={0}
                  cy={0}
                  r={30}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Recursive rendering of children */}
        {renderTree(node.left, node.x, node.y)}
        {renderTree(node.right, node.x, node.y)}
      </React.Fragment>
    );
  };

  const handleInsertNode = () => {
    const value = Math.floor(Math.random() * 100) + 1;
    const nodeId = `manual-${Date.now()}`;
    const newNode = createBSTNode(nodeId, value);
    setTree(prevTree => insertNodeIntoTree(prevTree, newNode));
    setInsertedNodes(prev => new Set([...prev, nodeId]));
  };

  const handleReset = () => {
    setTree(null);
    setHighlightedNodes(new Set());
    setInsertedNodes(new Set());
    dispatch({ type: 'RESET' });
  };

  const handleClearTree = () => {
    setTree(null);
    setHighlightedNodes(new Set());
    setInsertedNodes(new Set());
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 lg:p-8 ${className}`}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 lg:mb-6 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Binary Search Tree</h2>
          <p className="text-sm lg:text-base text-gray-600 mt-1">
            Interactive tree operations with animated insertions and traversals
          </p>
        </div>
        
        {state.viewMode === 'technical' && (
          <div className="bg-gray-50 rounded-lg p-3 lg:p-4 text-xs lg:text-sm w-full lg:w-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4">
              <div>
                <span className="font-medium text-gray-700">Search:</span>
                <div className="mt-1">O(log n) avg, O(n) worst</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Insert/Delete:</span>
                <div className="mt-1">O(log n) avg, O(n) worst</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          width="100%"
          height="300"
          className="mx-auto border border-gray-100 rounded-lg bg-gray-50"
          viewBox="0 0 600 300"
          preserveAspectRatio="xMidYMid meet"
        >
          {renderTree(tree)}
          
          {/* Empty state message */}
          {!tree && (
            <text
              x="300"
              y="150"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#9CA3AF"
              fontSize="14"
            >
              <tspan x="300" dy="0">Click "Play" to start BST operations</tspan>
              <tspan x="300" dy="20">or "Insert Node" to add manually</tspan>
            </text>
          )}
        </svg>
      </div>

      {/* Manual controls */}
      <div className="mt-4 lg:mt-6 flex flex-wrap gap-2 lg:gap-4 justify-center">
        <Button
          onClick={handleInsertNode}
          className="px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <span className="hidden sm:inline">Insert Random Node</span>
          <span className="sm:hidden">Insert Node</span>
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          className="px-3 lg:px-4 py-2 text-sm"
        >
          <span className="hidden sm:inline">Reset Algorithm</span>
          <span className="sm:hidden">Reset</span>
        </Button>
        <Button
          onClick={handleClearTree}
          variant="outline"
          className="px-3 lg:px-4 py-2 text-sm"
        >
          <span className="hidden sm:inline">Clear Tree</span>
          <span className="sm:hidden">Clear</span>
        </Button>
      </div>

      {/* Legend */}
      <div className="mt-4 lg:mt-6 flex flex-wrap justify-center gap-2 lg:gap-4 text-xs lg:text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span className="text-gray-600">Node</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
          <span className="text-gray-600">Traversing</span>
        </div>
      </div>
    </div>
  );
};
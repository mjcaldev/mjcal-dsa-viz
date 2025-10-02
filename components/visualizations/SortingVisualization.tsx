"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlgorithm } from '@/contexts/AlgorithmContext';

export const SortingVisualization: React.FC = () => {
  const { state, dispatch } = useAlgorithm();
  const [windowWidth, setWindowWidth] = React.useState(800); // Default fallback width

  // Handle window resize and initial width
  useEffect(() => {
    const updateWidth = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial width
    updateWidth();

    // Add resize listener
    window.addEventListener('resize', updateWidth);

    // Cleanup
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Auto-play logic
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

  const maxValue = Math.max(...state.array);
  const containerHeight = 400;

  const getBarColor = (index: number) => {
    if (state.sortedIndices.has(index)) return '#10B981'; // green
    if (state.compareIndices.has(index)) return '#F59E0B'; // amber
    if (state.highlightIndices.has(index)) return '#8B5CF6'; // purple
    if (state.pivotIndex !== undefined && state.pivotIndex === index) return '#EF4444'; // red
    return '#3B82F6'; // blue
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-8">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 lg:mb-6 space-y-4 lg:space-y-0">
        <div className="w-full lg:w-auto">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 capitalize">
            {state.algorithm} Sort
          </h2>
          <p className="text-sm lg:text-base text-gray-600 mt-1">
            Visualizing the sorting algorithm with step-by-step animations
          </p>
        </div>
        
        {state.viewMode === 'technical' && (
          <div className="bg-gray-50 rounded-lg p-3 lg:p-4 text-xs lg:text-sm w-full lg:w-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4">
              <div>
                <span className="font-medium text-gray-700">Time Complexity:</span>
                <div className="mt-1">
                  {state.algorithm === 'bubble' && 'O(n²)'}
                  {state.algorithm === 'merge' && 'O(n log n)'}
                  {state.algorithm === 'quick' && 'O(n log n)'}
                  {state.algorithm === 'heap' && 'O(n log n)'}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Space Complexity:</span>
                <div className="mt-1">
                  {state.algorithm === 'bubble' && 'O(1)'}
                  {state.algorithm === 'merge' && 'O(n)'}
                  {state.algorithm === 'quick' && 'O(log n)'}
                  {state.algorithm === 'heap' && 'O(1)'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div 
        className="flex items-end justify-center space-x-2 mx-auto"
        style={{ height: containerHeight, maxWidth: '100%' }}
      >
        <AnimatePresence mode="wait">
          {state.array.map((value, index) => {
            const height = (value / maxValue) * (containerHeight - 60);
            
            return (
              <motion.div
                key={`${index}-${value}`}
                layout
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: height,
                  opacity: 1,
                  backgroundColor: getBarColor(index),
                  scale: state.compareIndices.has(index) ? 1.05 : 1,
                }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                  backgroundColor: { duration: 0.2 },
                  scale: { duration: 0.1 }
                }}
                className="relative flex items-end justify-center rounded-t-md shadow-sm"
                style={{
                  width: `${Math.max((windowWidth * 0.8) / state.array.length - 4, 20)}px`,
                  minWidth: '20px',
                  maxWidth: '60px'
                }}
              >
                <motion.span 
                  className="absolute -bottom-6 text-xs lg:text-sm font-medium text-gray-700 text-center w-full"
                  animate={{ 
                    color: state.compareIndices.has(index) ? '#F59E0B' : '#374151',
                    fontWeight: state.compareIndices.has(index) ? 600 : 500
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {value}
                </motion.span>
                
                {/* Highlight effect for active comparisons */}
                {state.compareIndices.has(index) && (
                  <motion.div
                    className="absolute -inset-1 border-2 border-amber-400 rounded-t-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                
                {/* Pivot indicator */}
                {state.pivotIndex !== undefined && state.pivotIndex === index && (
                  <motion.div
                    className="absolute -top-6 lg:-top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-red-600"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    PIVOT
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="mt-6 lg:mt-8 flex flex-wrap justify-center gap-2 lg:gap-4 text-xs lg:text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-gray-600">Unsorted</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-amber-500 rounded"></div>
          <span className="text-gray-600">Comparing</span>
        </div>
        {state.algorithm === 'quick' && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-600">Pivot</span>
          </div>
        )}
        {state.highlightIndices.size > 0 && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-gray-600">Highlighted</span>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600">Sorted</span>
        </div>
      </div>
    </div>
  );
};
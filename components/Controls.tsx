"use client";

import React from 'react';
import { useAlgorithm } from '@/contexts/AlgorithmContext';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw,
  Shuffle,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export const Controls: React.FC = () => {
  const { state, dispatch, generateSteps } = useAlgorithm();

  const handlePlay = () => {
    if (state.steps.length === 0) {
      generateSteps(state.algorithm, state.array);
    }
    dispatch({ type: 'PLAY' });
  };

  const handlePause = () => {
    dispatch({ type: 'PAUSE' });
  };

  const handleNext = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const handlePrev = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
  };

  const handleShuffle = () => {
    if (state.algorithm === 'bubble' || state.algorithm === 'merge' || 
        state.algorithm === 'quick' || state.algorithm === 'heap') {
      const newArray = [...state.array].sort(() => Math.random() - 0.5);
      dispatch({ type: 'SET_ARRAY', array: newArray });
    }
  };

  const handleSpeedChange = (value: number[]) => {
    dispatch({ type: 'SET_SPEED', speed: 2100 - value[0] });
  };

  const toggleViewMode = () => {
    dispatch({ 
      type: 'SET_VIEW_MODE', 
      mode: state.viewMode === 'simple' ? 'technical' : 'simple' 
    });
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4 lg:border-b lg:border-r-0">
      <div className="flex flex-col lg:flex-row items-center justify-between max-w-6xl mx-auto space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-1 lg:space-x-2 flex-wrap justify-center lg:justify-start">
          <Button
            onClick={state.isPlaying ? handlePause : handlePlay}
            className="px-3 lg:px-4 py-2 text-sm"
            disabled={state.currentStep >= state.steps.length - 1 && state.steps.length > 0}
          >
            {state.isPlaying ? (
              <Pause className="h-4 w-4 mr-1 lg:mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-1 lg:mr-2" />
            )}
            <span className="hidden sm:inline">{state.isPlaying ? 'Pause' : 'Play'}</span>
          </Button>

          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={state.currentStep <= -1}
            className="px-2 lg:px-3"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={state.currentStep >= state.steps.length - 1 || state.steps.length === 0}
            className="px-2 lg:px-3"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={handleReset}
            disabled={state.currentStep === -1}
            className="px-2 lg:px-3 text-sm"
          >
            <RotateCcw className="h-4 w-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Reset</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleShuffle}
            disabled={state.isPlaying || 
                     (state.algorithm !== 'bubble' && state.algorithm !== 'merge' && 
                      state.algorithm !== 'quick' && state.algorithm !== 'heap')}
            className="px-2 lg:px-3 text-sm"
          >
            <Shuffle className="h-4 w-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Shuffle</span>
          </Button>
        </div>

        <div className="flex items-center space-x-3 lg:space-x-6">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="text-xs lg:text-sm text-gray-600 whitespace-nowrap">Speed:</span>
            <div className="w-16 lg:w-24">
              <Slider
                value={[2100 - state.speed]}
                onValueChange={handleSpeedChange}
                max={2000}
                min={100}
                step={100}
                className="cursor-pointer"
              />
            </div>
          </div>

          <Button
            variant="outline"
            onClick={toggleViewMode}
            className="px-2 lg:px-3 text-xs lg:text-sm"
          >
            <Settings className="h-4 w-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">{state.viewMode === 'simple' ? 'Technical' : 'Simple'}</span>
            <span className="sm:hidden">{state.viewMode === 'simple' ? 'Tech' : 'Simple'}</span>
          </Button>
        </div>
      </div>

      {state.currentStep >= 0 && state.steps[state.currentStep] && (
        <div className="max-w-6xl mx-auto mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 overflow-hidden">
          <p className="text-xs lg:text-sm text-blue-800 break-words">
            <span className="font-medium">Step {state.currentStep + 1}/{state.steps.length}:</span>{' '}
            {state.steps[state.currentStep].description}
          </p>
        </div>
      )}
    </div>
  );
};
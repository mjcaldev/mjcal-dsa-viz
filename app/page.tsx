"use client";

import { AlgorithmProvider } from '@/contexts/AlgorithmContext';
import { Sidebar } from '@/components/Sidebar';
import { Controls } from '@/components/Controls';
import { MainVisualization } from '@/components/MainVisualization';

export default function Home() {
  return (
    <AlgorithmProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        <Controls />
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <Sidebar />
          <MainVisualization />
        </div>
      </div>
    </AlgorithmProvider>
  );
}
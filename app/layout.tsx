import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DSA Visualizer - Interactive Algorithm Learning',
  description: 'Learn data structures and algorithms through interactive visualizations with step-by-step animations. Features sorting algorithms, binary search trees, and graph traversals.',
  keywords: 'data structures, algorithms, visualization, sorting, binary search tree, graph traversal, BFS, DFS, educational',
  authors: [{ name: 'DSA Visualizer' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
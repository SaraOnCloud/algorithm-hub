import { AlgorithmCategory, AlgorithmDifficulty } from '../entities/algorithm.entity';

export interface SeedAlgorithm {
  slug: string;
  name: string;
  category: AlgorithmCategory;
  difficulty: AlgorithmDifficulty;
  description?: string;
}

export const SEED_ALGORITHMS: SeedAlgorithm[] = [
  { slug: 'bubble-sort', name: 'Bubble Sort', category: 'sorting', difficulty: 'easy', description: 'Simple adjacent pair swap sort.' },
  { slug: 'insertion-sort', name: 'Insertion Sort', category: 'sorting', difficulty: 'easy', description: 'Builds the sorted list by inserting each element into position.' },
  { slug: 'selection-sort', name: 'Selection Sort', category: 'sorting', difficulty: 'easy', description: 'Repeatedly selects the next minimum and places it in front.' },
  { slug: 'merge-sort', name: 'Merge Sort', category: 'sorting', difficulty: 'medium', description: 'Divide & conquer; merges pre‑sorted sublists efficiently.' },
  { slug: 'quick-sort', name: 'Quick Sort', category: 'sorting', difficulty: 'medium', description: 'Partitions around a pivot and recursively sorts partitions.' },
  { slug: 'binary-search', name: 'Binary Search', category: 'search', difficulty: 'easy', description: 'Logarithmic search in a sorted array.' },
  { slug: 'breadth-first-search', name: 'Breadth-First Search (BFS)', category: 'graph', difficulty: 'easy', description: 'Level‑order traversal from a source node in a graph.' },
  { slug: 'depth-first-search', name: 'Depth-First Search (DFS)', category: 'graph', difficulty: 'easy', description: 'Deep exploration traversal of a graph.' },
  { slug: 'dijkstra', name: 'Dijkstra', category: 'graph', difficulty: 'medium', description: 'Single‑source shortest paths with non‑negative weights.' },
  { slug: 'bellman-ford', name: 'Bellman-Ford', category: 'graph', difficulty: 'medium', description: 'Shortest paths with negative edge cycle detection.' },
  { slug: 'floyd-warshall', name: 'Floyd-Warshall', category: 'graph', difficulty: 'medium', description: 'All‑pairs shortest paths in weighted graphs.' },
  { slug: 'kruskal', name: 'Kruskal', category: 'graph', difficulty: 'medium', description: 'Minimum spanning tree using disjoint sets.' },
  { slug: 'prim', name: 'Prim', category: 'graph', difficulty: 'medium', description: 'Minimum spanning tree grown incrementally.' },
  { slug: 'kmp', name: 'Knuth–Morris–Pratt (KMP)', category: 'string', difficulty: 'medium', description: 'Pattern search via prefix (failure) function.' },
  { slug: 'rabin-karp', name: 'Rabin-Karp', category: 'string', difficulty: 'medium', description: 'String search using rolling hash.' },
  { slug: 'knapsack-01', name: '0/1 Knapsack', category: 'dp', difficulty: 'medium', description: 'Optimal item selection under capacity constraint.' },
  { slug: 'lis', name: 'Longest Increasing Subsequence (LIS)', category: 'dp', difficulty: 'medium', description: 'Longest strictly increasing subsequence.' },
  { slug: 'topological-sort', name: 'Topological Sort', category: 'graph', difficulty: 'easy', description: 'Dependency‑respecting linear order of a DAG.' },
  { slug: 'activity-selection', name: 'Activity Selection', category: 'greedy', difficulty: 'easy', description: 'Maximum set of pairwise‑compatible activities.' },
  { slug: 'binary-tree-traversals', name: 'Binary Tree Traversals (In/Pre/Post)', category: 'tree', difficulty: 'easy', description: 'Fundamental binary tree traversal orders.' },
];


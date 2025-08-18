import { AlgorithmCategory, AlgorithmDifficulty } from '../entities/algorithm.entity';

export interface SeedAlgorithm {
  slug: string;
  name: string;
  category: AlgorithmCategory;
  difficulty: AlgorithmDifficulty;
  description?: string;
}

export const SEED_ALGORITHMS: SeedAlgorithm[] = [
  { slug: 'bubble-sort', name: 'Bubble Sort', category: 'sorting', difficulty: 'easy', description: 'Ordenamiento simple por intercambio de pares adyacentes.' },
  { slug: 'insertion-sort', name: 'Insertion Sort', category: 'sorting', difficulty: 'easy', description: 'Inserta elementos en su posición correcta construyendo una lista ordenada.' },
  { slug: 'selection-sort', name: 'Selection Sort', category: 'sorting', difficulty: 'easy', description: 'Selecciona el mínimo sucesivo y lo coloca al inicio.' },
  { slug: 'merge-sort', name: 'Merge Sort', category: 'sorting', difficulty: 'medium', description: 'Divide y vencerás, combina listas ordenadas eficientemente.' },
  { slug: 'quick-sort', name: 'Quick Sort', category: 'sorting', difficulty: 'medium', description: 'Particiona en torno a un pivote y ordena recursivamente.' },
  { slug: 'binary-search', name: 'Binary Search', category: 'search', difficulty: 'easy', description: 'Búsqueda logarítmica en arreglos ordenados.' },
  { slug: 'breadth-first-search', name: 'Breadth-First Search (BFS)', category: 'graph', difficulty: 'easy', description: 'Recorre grafos por niveles desde un nodo fuente.' },
  { slug: 'depth-first-search', name: 'Depth-First Search (DFS)', category: 'graph', difficulty: 'easy', description: 'Recorre grafos explorando en profundidad.' },
  { slug: 'dijkstra', name: 'Dijkstra', category: 'graph', difficulty: 'medium', description: 'Caminos mínimos en grafos con pesos no negativos.' },
  { slug: 'bellman-ford', name: 'Bellman-Ford', category: 'graph', difficulty: 'medium', description: 'Caminos mínimos con detección de ciclos negativos.' },
  { slug: 'floyd-warshall', name: 'Floyd-Warshall', category: 'graph', difficulty: 'medium', description: 'Todos los pares de caminos mínimos en grafos ponderados.' },
  { slug: 'kruskal', name: 'Kruskal', category: 'graph', difficulty: 'medium', description: 'Árbol de expansión mínima usando conjuntos disjuntos.' },
  { slug: 'prim', name: 'Prim', category: 'graph', difficulty: 'medium', description: 'Árbol de expansión mínima con crecimiento incremental.' },
  { slug: 'kmp', name: 'Knuth–Morris–Pratt (KMP)', category: 'string', difficulty: 'medium', description: 'Búsqueda de patrones con prefijos/sufijos eficientes.' },
  { slug: 'rabin-karp', name: 'Rabin-Karp', category: 'string', difficulty: 'medium', description: 'Búsqueda de cadenas usando hashing rodante.' },
  { slug: 'knapsack-01', name: '0/1 Knapsack', category: 'dp', difficulty: 'medium', description: 'Selección óptima de ítems con restricción de capacidad.' },
  { slug: 'lis', name: 'Longest Increasing Subsequence (LIS)', category: 'dp', difficulty: 'medium', description: 'Subsecuencia estrictamente creciente más larga.' },
  { slug: 'topological-sort', name: 'Topological Sort', category: 'graph', difficulty: 'easy', description: 'Orden lineal de DAG basado en dependencias.' },
  { slug: 'activity-selection', name: 'Activity Selection', category: 'greedy', difficulty: 'easy', description: 'Selección de actividades compatibles maximizando cantidad.' },
  { slug: 'binary-tree-traversals', name: 'Recorridos de Árbol Binario (In/Pre/Post)', category: 'tree', difficulty: 'easy', description: 'Recorridos fundamentales en árboles binarios.' },
];


import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
// Type-only imports para que TS resuelva rutas lazy sin afectar el runtime
import type { BubbleSortComponent } from './features/algorithms/custom/bubble-sort.component';
import type { InsertionSortComponent } from './features/algorithms/custom/insertion-sort.component';
import type { SelectionSortComponent } from './features/algorithms/custom/selection-sort.component';
import type { MergeSortComponent } from './features/algorithms/custom/merge-sort.component';
import type { QuickSortComponent } from './features/algorithms/custom/quick-sort.component';
import type { BinarySearchComponent } from './features/algorithms/custom/binary-search.component';
import type { BreadthFirstSearchComponent } from './features/algorithms/custom/breadth-first-search.component';
import type { DepthFirstSearchComponent } from './features/algorithms/custom/depth-first-search.component';
import type { DijkstraComponent } from './features/algorithms/custom/dijkstra.component';
import type { BellmanFordComponent } from './features/algorithms/custom/bellman-ford.component';
import type { FloydWarshallComponent } from './features/algorithms/custom/floyd-warshall.component';
import type { KruskalComponent } from './features/algorithms/custom/kruskal.component';
import type { PrimComponent } from './features/algorithms/custom/prim.component';
import type { KmpComponent } from './features/algorithms/custom/kmp.component';
import type { RabinKarpComponent } from './features/algorithms/custom/rabin-karp.component';
import type { Knapsack01Component } from './features/algorithms/custom/knapsack-01.component';
import type { LisComponent } from './features/algorithms/custom/lis.component';
import type { TopologicalSortComponent } from './features/algorithms/custom/topological-sort.component';
import type { BinaryTreeTraversalsComponent } from './features/algorithms/custom/binary-tree-traversals.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'algorithms' },
  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
    ],
  },
  {
    path: 'algorithms',
    children: [
      { path: '', loadComponent: () => import('./features/algorithms/algorithms-list.component').then(m => m.AlgorithmsListComponent) },
      // Rutas personalizadas por algoritmo
      { path: 'bubble-sort', loadComponent: () => import('./features/algorithms/custom/bubble-sort.component').then(m => m.BubbleSortComponent) },
      { path: 'insertion-sort', loadComponent: () => import('./features/algorithms/custom/insertion-sort.component').then(m => m.InsertionSortComponent) },
      { path: 'selection-sort', loadComponent: () => import('./features/algorithms/custom/selection-sort.component').then(m => m.SelectionSortComponent) },
      { path: 'merge-sort', loadComponent: () => import('./features/algorithms/custom/merge-sort.component').then(m => m.MergeSortComponent) },
      { path: 'quick-sort', loadComponent: () => import('./features/algorithms/custom/quick-sort.component').then(m => m.QuickSortComponent) },
      { path: 'binary-search', loadComponent: () => import('./features/algorithms/custom/binary-search.component').then(m => m.BinarySearchComponent) },
      { path: 'breadth-first-search', loadComponent: () => import('./features/algorithms/custom/breadth-first-search.component').then(m => m.BreadthFirstSearchComponent) },
      { path: 'depth-first-search', loadComponent: () => import('./features/algorithms/custom/depth-first-search.component').then(m => m.DepthFirstSearchComponent) },
      { path: 'dijkstra', loadComponent: () => import('./features/algorithms/custom/dijkstra.component').then(m => m.DijkstraComponent) },
      { path: 'bellman-ford', loadComponent: () => import('./features/algorithms/custom/bellman-ford.component').then(m => m.BellmanFordComponent) },
      { path: 'floyd-warshall', loadComponent: () => import('./features/algorithms/custom/floyd-warshall.component').then(m => m.FloydWarshallComponent) },
      { path: 'kruskal', loadComponent: () => import('./features/algorithms/custom/kruskal.component').then(m => m.KruskalComponent) },
      { path: 'prim', loadComponent: () => import('./features/algorithms/custom/prim.component').then(m => m.PrimComponent) },
      { path: 'kmp', loadComponent: () => import('./features/algorithms/custom/kmp.component').then(m => m.KmpComponent) },
      { path: 'rabin-karp', loadComponent: () => import('./features/algorithms/custom/rabin-karp.component').then(m => m.RabinKarpComponent) },
      { path: 'knapsack-01', loadComponent: () => import('./features/algorithms/custom/knapsack-01.component').then(m => m.Knapsack01Component) },
      { path: 'lis', loadComponent: () => import('./features/algorithms/custom/lis.component').then(m => m.LisComponent) },
      { path: 'topological-sort', loadComponent: () => import('./features/algorithms/custom/topological-sort.component').then(m => m.TopologicalSortComponent) },
      { path: 'activity-selection', loadComponent: () => import('./features/algorithms/custom/activity-selection.component').then(m => m.ActivitySelectionComponent) },
      { path: 'binary-tree-traversals', loadComponent: () => import('./features/algorithms/custom/binary-tree-traversals.component').then(m => m.BinaryTreeTraversalsComponent) },
      // Fallback genérico
      { path: ':slug', loadComponent: () => import('./features/algorithms/algorithm-detail.component').then(m => m.AlgorithmDetailComponent) },
    ],
  },
  { path: 'progress', canActivate: [authGuard], loadComponent: () => import('./features/progress/progress.component').then(m => m.ProgressComponent) },
  { path: '**', redirectTo: 'algorithms' },
];

// $lib/types.ts
export interface Tab {
  id: number;
  colors: {
    categories: Record<string, string>;
    subCategories: Record<string, string>;
    ranks: Record<string, string>;
  };
}

export interface BenchmarkSpec {
  label: string;
  tabs: Record<string, Tab>;
}

export type AllBenchmarks = Record<string, BenchmarkSpec>;

export interface Scenario {
  score: number;
  leaderboard_rank: number;
  scenario_rank: number;
  rank_maxes: number[];
}

export interface Category {
  benchmark_progress: number;
  category_rank: number;
  rank_maxes: number[];
  scenarios: Record<string, Scenario>;
}

export interface Rank {
  icon: string;
  name: string;
  color: string;
  frame: string;
  description: string;
  playercard_large: string;
  playercard_small: string;
}

export interface BenchmarkResponse {
  benchmark_progress: number;
  overall_rank: number;
  categories: Record<string, Category>;
  ranks: Rank[];
}
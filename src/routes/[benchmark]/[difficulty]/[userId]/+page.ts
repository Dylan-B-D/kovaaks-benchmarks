import type { AllBenchmarks, BenchmarkResponse } from '$lib/types';
import raw from '$lib/benchmarks.json';

const specs: AllBenchmarks = raw;

export async function load({ params, fetch }) {
  const { benchmark, difficulty, userId } = params;

  const selected = specs[benchmark];
  const label = selected?.label ?? 'Unknown';
  const tab = selected?.tabs[difficulty];
  const benchmarkId = tab?.id;
  const colors = tab?.colors ?? { categories: {}, subCategories: {}, ranks: {} };

  if (!benchmarkId) {
    return {
      benchmark,
      difficulty,
      userId,
      label,
      availableTabs: selected?.tabs ?? {},
      colors,
      benchmark_progress: 0,
      overall_rank: 0,
      categories: {},
      ranks: []
    };
  }

  try {
    const url = `https://kovaaks.com/webapp-backend/benchmarks/player-progress-rank-benchmark?benchmarkId=${benchmarkId}&steamId=${userId}&page=0&max=100`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`API error: ${res.status} ${res.statusText}`);
      return {
        benchmark,
        difficulty,
        userId,
        label,
        availableTabs: selected?.tabs ?? {},
        colors,
        benchmark_progress: 0,
        overall_rank: 0,
        categories: {},
        ranks: []
      };
    }
    const json = (await res.json()) as BenchmarkResponse;

    return {
      benchmark,
      difficulty,
      userId,
      label,
      availableTabs: selected?.tabs ?? {},
      colors,
      ...json
    };
  } catch (error) {
    console.error('Failed to fetch benchmark data:', error);
    return {
      benchmark,
      difficulty,
      userId,
      label,
      availableTabs: selected?.tabs ?? {},
      colors,
      benchmark_progress: 0,
      overall_rank: 0,
      categories: {},
      ranks: []
    };
  }
}


export const prerender = false;
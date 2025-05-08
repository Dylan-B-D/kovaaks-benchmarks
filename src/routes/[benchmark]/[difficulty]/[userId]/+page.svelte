<script lang="ts">
  import { goto } from '$app/navigation';
  import type { BenchmarkResponse, Rank, Category, Scenario } from '$lib/types';

  let { data } = $props<{
    benchmark: string;
    difficulty: string;
    userId: string;
    label: string;
    availableTabs: Record<string, any>;
    colors: {
      categories: Record<string, string>;
      subCategories: Record<string, string>;
      ranks: Record<string, string>;
    };
    benchmark_progress: number;
    overall_rank: number;
    categories: Record<string, Category>;
    ranks: Rank[];
  } & BenchmarkResponse>();

  function goToDifficulty(diff: string) {
    goto(`/${data.benchmark}/${diff}/${data.userId}`);
  }

  function goHome() {
    goto('/');
  }

  function formatScore(score: number): string {
    const divided = score / 100;
    return divided % 1 === 0 ? divided.toString() : divided.toFixed(2);
  }

  function formatProgress(progress: number): string {
    return (progress / 100).toFixed(2);
  }

  const subCategoryOrder = ['Dynamic', 'Static', 'Precise', 'Reactive', 'Speed', 'Evasive'];
  const scenariosPerSubCategory = 3;

  function getSubCategory(category: string, scenarioIndex: number): string {
    const subCategoryIndex = Math.floor(scenarioIndex / scenariosPerSubCategory);
    const categoryIndex = ['Clicking', 'Tracking', 'Switching'].indexOf(category);
    const offset = categoryIndex * 2;
    return subCategoryOrder[offset + subCategoryIndex] || 'Unknown';
  }

  function getTextColor(hex: string): string {
    if (!hex) return '#fff';
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
    const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
    const b = parseInt(cleanHex.slice(4, 6), 16) / 255;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance < 0.5 ? '#fff' : '#000';
  }

  function fadeColor(hex: string, opacity: number = 0.3): string {
    if (!hex) return 'rgba(31, 41, 55, 0.75)';
    const cleanHex = hex.replace('#', '');
    const r = Math.round(parseInt(cleanHex.slice(0, 2), 16) * 0.8 + 255 * 0.2);
    const g = Math.round(parseInt(cleanHex.slice(2, 4), 16) * 0.8 + 255 * 0.2);
    const b = Math.round(parseInt(cleanHex.slice(4, 6), 16) * 0.8 + 255 * 0.2);
    return `rgba(${r}, ${g}, ${b}, 1)`;
  }

  function getRankForScore(score: number, rankMaxes: number[]): number {
    for (let i = rankMaxes.length - 1; i >= 0; i--) {
      if (score >= rankMaxes[i] * 100) return i + 1;
    }
    return 0;
  }

  function getProgressToNextRank(score: number, rankMaxes: number[]): number {
    const currentRank = getRankForScore(score, rankMaxes);
    if (currentRank >= rankMaxes.length) return 100;
    
    const currentThreshold = currentRank > 0 ? rankMaxes[currentRank - 1] * 100 : 0;
    const nextThreshold = rankMaxes[currentRank] * 100;
    
    return ((score - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  }

  function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function processCategoryEntries() {
    return Object.entries(data.categories).map(([category, categoryData]) => {
      return {
        category,
        categoryData: categoryData as Category
      };
    });
  }

  function processScenarioEntries(categoryData: Category) {
    return Object.entries(categoryData.scenarios).map(([scenario, scenarioData], index) => {
      return {
        scenario,
        scenarioData: scenarioData as Scenario,
        index
      };
    });
  }

  function isRankComplete(): boolean {
    return processCategoryEntries().every(({ categoryData }) =>
      processScenarioEntries(categoryData).every(({ scenarioData: s }) =>
        getRankForScore(s.score, s.rank_maxes) === data.overall_rank
      )
    );
  }

  function getLowestHighestRankPerSubCategory(): number {
    const subCategoryRanks = new Map<string, number>();
    
    processCategoryEntries().forEach(({ category, categoryData }) => {
      processScenarioEntries(categoryData).forEach(({ scenarioData: s, index: i }) => {
        const subCategory = getSubCategory(category, i);
        const currentRank = getRankForScore(s.score, s.rank_maxes);
        
        // For each subcategory, keep track of the highest rank achieved
        if (!subCategoryRanks.has(subCategory) || currentRank > subCategoryRanks.get(subCategory)!) {
          subCategoryRanks.set(subCategory, currentRank);
        }
      });
    });
    
    // Find the lowest rank among the highest ranks of each subcategory
    return Math.min(...Array.from(subCategoryRanks.values()));
  }

  function getDisplayRank(): string {
    const actualRank = getLowestHighestRankPerSubCategory();
    const baseRank = data.ranks[actualRank]?.name || 'Unknown';
    return isRankComplete() && actualRank > 0 ? `${baseRank} Complete` : baseRank;
  }
</script>

<div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
  <div class="w-full max-w-5xl bg-gray-800 rounded-xl shadow-xl p-4">
    <!-- Header Section -->
    <div class="flex flex-col gap-4 mb-6">
      <!-- Top Row -->
      <div class="flex items-center justify-between">
        <button
          onclick={goHome}
          class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors flex items-center font-medium"
        >
          <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div class="flex-1 text-center">
          <h1 class="text-2xl font-bold text-white">{data.label}</h1>
        </div>
        <div class="w-[76px]"></div>
      </div>

      <!-- Info Row -->
      <div class="flex items-center px-4 relative">
        <div class="text-gray-400 text-sm absolute left-4">
          Steam ID: {data.userId}
        </div>
        
        <div class="w-full flex justify-center">
          <span
            class="px-6 py-2 rounded-lg text-lg font-bold"
            style="background-color: {data.colors.ranks[data.ranks[getLowestHighestRankPerSubCategory()]?.name] || '#1f2937'}; 
                   color: {getTextColor(data.colors.ranks[data.ranks[getLowestHighestRankPerSubCategory()]?.name] || '#1f2937')}"
          >
            {getDisplayRank()}
          </span>
        </div>

        <div class="flex gap-1.5 absolute right-4">
          {#each Object.keys(data.availableTabs ?? {}) as diff}
            <button
              onclick={() => goToDifficulty(diff)}
              class="px-4 py-1.5 rounded-lg transition-colors font-medium {diff === data.difficulty
                ? 'bg-gray-600 text-white border-2 border-blue-500 shadow-md shadow-blue-500/20'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'}"
            >
              {capitalizeFirst(diff)}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Table -->
    {#if data.benchmark_progress !== undefined && data.ranks && data.categories}
      <table class="w-full rounded-lg text-sm">
        <thead>
          <tr>
            <th class="px-2 py-1"></th>
            <th class="px-2 py-1"></th>
            <th class="px-2 py-1 text-left text-gray-200 font-semibold bg-gray-700 rounded-l-lg">Scenario Name</th>
            <th class="px-2 py-1 text-center text-gray-200 font-semibold bg-gray-700">Score</th>
            <th class="px-8 py-1 text-center text-gray-200 font-semibold bg-gray-700">Progress</th>
            <th class="px-0 py-1 bg-gray-700 rounded-r-lg">
              <div class="flex justify-between space-x-2">
                {#each data.ranks.slice(1) as rank}
                  <div class="rank-header text-gray-200"><span>{rank.name}</span></div>
                {/each}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {#each processCategoryEntries() as { category, categoryData }}
            {#each processScenarioEntries(categoryData) as { scenario, scenarioData: s, index: i }}
              <tr class="sub-category-row">
                {#if i === 0}
                  <td class="align-middle text-center font-medium h-24" rowspan={Object.keys(categoryData.scenarios).length}>
                    <div class="category-header h-full" style="background-color: {fadeColor(data.colors.categories[category])}; color: {getTextColor(data.colors.categories[category])}">
                      <span>{category}</span>
                    </div>
                  </td>
                {/if}
                {#if i % scenariosPerSubCategory === 0}
                  <td class="align-middle text-center font-medium h-24 sub-category-cell" rowspan={scenariosPerSubCategory} 
                      style="background-color: {data.colors.subCategories[getSubCategory(category, i)] || '#fff'}; 
                             color: {getTextColor(data.colors.subCategories[getSubCategory(category, i)])}">
                    <div class="transform -rotate-90 whitespace-nowrap h-full flex items-center justify-center">
                      {getSubCategory(category, i)}
                    </div>
                  </td>
                {/if}
                <td class="px-2 py-1 font-medium" 
                    style="background-color: {fadeColor(data.colors.subCategories[getSubCategory(category, i)], 0.75)}; 
                           color: {getTextColor(data.colors.subCategories[getSubCategory(category, i)])}">
                  {scenario}
                </td>
                <td class="px-2 py-1 text-center relative group font-medium scenario-score-cell" 
                    style="background-color: {fadeColor(data.colors.ranks[data.ranks[getRankForScore(s.score, s.rank_maxes)]?.name], 0.75)}; 
                           color: {getTextColor(data.colors.ranks[data.ranks[getRankForScore(s.score, s.rank_maxes)]?.name])}">
                  <span>{formatScore(s.score)}</span>
                  <span class="absolute hidden group-hover:block bg-gray-800 text-gray-200 px-2 py-1 rounded -top-8 right-0 text-sm">
                    Leaderboard Position: #{s.leaderboard_rank}
                  </span>
                </td>
                <td class="px-2">
                  <div class="w-full h-4 bg-gray-800 rounded overflow-hidden relative">
                    <div class="absolute inset-0 bg-gray-700"></div>
                    {#if getRankForScore(s.score, s.rank_maxes) >= s.rank_maxes.length}
                      <div class="h-full relative z-10" style="width: 100%; background-color: {data.colors.ranks[data.ranks[s.rank_maxes.length]?.name]}"></div>
                    {:else}
                      <div class="h-full relative z-10" style="width: {getProgressToNextRank(s.score, s.rank_maxes)}%; background-color: {data.colors.ranks[data.ranks[getRankForScore(s.score, s.rank_maxes) + 1]?.name]}"></div>
                    {/if}
                  </div>
                </td>
                <td class="p-0">
                  <div class="flex justify-between space-x-2">
                    {#each s.rank_maxes as max, j}
                      <div class="rank-cell" style="background-color: {fadeColor(data.colors.ranks[data.ranks[j + 1]?.name], 0.75)}; color: {getTextColor(data.colors.ranks[data.ranks[j + 1]?.name])}"><span>{max}</span></div>
                    {/each}
                  </div>
                </td>
              </tr>
            {/each}
          {/each}
        </tbody>
      </table>
    {:else}
      <div class="text-center text-gray-400 py-8">
        No benchmark data available
      </div>
    {/if}
  </div>
</div>

<style>
  table {
    border-collapse: separate;
  }
  th,
  td {
    white-space: nowrap;
  }
  td > div.transform {
    width: 1.5rem;
  }

  .sub-category-cell {
    border-top-left-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
  }

  .sub-category-row:first-child .scenario-score-cell {
    border-top-right-radius: 0.5rem;
  }

  .sub-category-row:last-child .scenario-score-cell {
    border-bottom-right-radius: 0.5rem;
  }

  .sub-category-row:nth-child(3n) .scenario-score-cell {
    border-bottom-right-radius: 0.5rem;
  }

  .sub-category-row:nth-child(3n-2) .scenario-score-cell {
    border-top-right-radius: 0.5rem;
  }

  /* rounding only to first and last rank-cell in blocks of 3 */
  .sub-category-row:nth-child(3n-2) .rank-cell:first-child {
    border-top-left-radius: 0.5rem;
  }

  .sub-category-row:nth-child(3n-2) .rank-cell:last-child {
    border-top-right-radius: 0.5rem;
  }

  .sub-category-row:nth-child(3n) .rank-cell:first-child {
    border-bottom-left-radius: 0.5rem;
  }

  .sub-category-row:nth-child(3n) .rank-cell:last-child {
    border-bottom-right-radius: 0.5rem;
  }

  /* first and last rows of the table */
  .sub-category-row:first-child .rank-cell:first-child {
    border-top-left-radius: 0.5rem;
  }

  .sub-category-row:first-child .rank-cell:last-child {
    border-top-right-radius: 0.5rem;
  }

  .sub-category-row:last-child .rank-cell:first-child {
    border-bottom-left-radius: 0.5rem;
  }

  .sub-category-row:last-child .rank-cell:last-child {
    border-bottom-right-radius: 0.5rem;
  }

  .rank-header, .rank-cell {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    min-width: 4rem;
    width: 100%;
    padding: 0.5rem 0.5rem;
    font-weight: 500;
    text-align: center;
    position: relative;
    height: 2rem;
  }
  
  .rank-header span, .rank-cell span {
    display: inline-block;
  }
  
  .rank-header {
    margin-right: 0.5rem;
    font-weight: 600;
  }
  
  .rank-cell {
    margin-right: -1px;
    border-radius: 0;
  }

  .category-header {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 0.5rem;
    font-weight: 600;
    width: 2rem;
  }

  .category-header span {
    transform: rotate(-90deg);
  }
</style>
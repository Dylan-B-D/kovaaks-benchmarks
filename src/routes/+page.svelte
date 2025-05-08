<script lang="ts">
    import specs from '$lib/benchmarks.json';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
  
    let selected = '';
    let steamId = '';
    let searchQuery = '';
    let filteredBenchmarks: [string, any][] = [];
  
    function go() {
      if (!selected || !steamId) return;
      const firstDifficulty = Object.keys(specs[selected as keyof typeof specs].tabs)[0];
      goto(`/${selected}/${firstDifficulty}/${steamId}`);
    }
  
    function filterBenchmarks() {
      filteredBenchmarks = Object.entries(specs).filter(([_, value]) =>
        value.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  
    onMount(() => {
      filteredBenchmarks = Object.entries(specs);
    });
  
    $: if (searchQuery !== undefined) {
      filterBenchmarks();
    }
  </script>
  
  <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-gray-800 rounded-xl shadow-xl p-6">
      <h1 class="text-2xl font-bold text-white mb-6 text-center">Select Benchmark</h1>
  
      <input
        type="text"
        placeholder="Search benchmarks..."
        bind:value={searchQuery}
        class="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
  
      <div class="max-h-64 overflow-y-auto mb-4 rounded-lg border border-gray-600">
        {#each filteredBenchmarks as [key, value]}
          <button
            class="w-full text-left p-3 text-white hover:bg-gray-700 transition-colors {selected === key ? 'bg-blue-600' : ''}"
            on:click={() => (selected = key)}
          >
            {value.label}
          </button>
        {:else}
          <div class="p-3 text-gray-400 text-center">No benchmarks found</div>
        {/each}
      </div>
  
      {#if selected}
        <input
          type="text"
          placeholder="Enter Steam ID"
          bind:value={steamId}
          class="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          on:click={go}
          class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!steamId}
        >
          Go
        </button>
      {/if}
    </div>
  </div>
  
  <style>
    /* Custom scrollbar for webkit browsers */
    .overflow-y-auto::-webkit-scrollbar {
      width: 8px;
    }
    .overflow-y-auto::-webkit-scrollbar-track {
      background: #1f2937;
    }
    .overflow-y-auto::-webkit-scrollbar-thumb {
      background: #4b5563;
      border-radius: 4px;
    }
    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
      background: #6b7280;
    }
  </style>
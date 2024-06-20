<script lang="ts">
	import type {EnrichedInitiative} from '@lusc/initiatives-tracker-util/types.js';

	import Initiative from '../components/initiative.svelte';
	import {getState} from '../state.ts';

	const initiatives = getState<EnrichedInitiative[]>();
</script>

<svelte:head>
	<title>Initiatives Tracker</title>
</svelte:head>

<div class="index">
	{#if initiatives}
		{#each initiatives as initiative (initiative.id)}
			<Initiative {initiative} allowEdit={false} standalone={false} />
		{/each}
	{:else}
		<div>Loading</div>
	{/if}
</div>

<style>
	.index {
		padding: 3em;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 2em;
	}
</style>

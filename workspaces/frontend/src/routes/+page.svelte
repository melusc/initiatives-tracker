<script lang="ts">
	import type {EnrichedInitiative} from '@lusc/initiatives-tracker-util/types.js';

	import Initiative from '../components/initiative.svelte';
	import {getState} from '../state.ts';
	import Loading from '../components/loading.svelte';
	import CreateButton from '../components/create-button.svelte';

	const initiatives = getState<EnrichedInitiative[]>();
</script>

<svelte:head>
	<title>Initiatives Tracker</title>
</svelte:head>

<CreateButton text="Add initiative" href="/initiative/create" />

<div class="index">
	{#if initiatives}
		{#each initiatives as initiative (initiative.id)}
			<Initiative {initiative} allowEdit={false} standalone={false} />
		{/each}
	{:else}
		<Loading />
	{/if}
</div>

<style>
	.index {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 2em;
	}
</style>

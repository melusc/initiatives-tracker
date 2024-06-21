<script lang="ts">
	import type {EnrichedInitiative} from '@lusc/initiatives-tracker-util/types.js';

	import Initiative from '../components/initiative.svelte';
	import {getState} from '../state.ts';
	import AddIcon from '../components/icons/add.svelte';
	import Loading from '../components/loading.svelte';

	const initiatives = getState<EnrichedInitiative[]>();
</script>

<svelte:head>
	<title>Initiatives Tracker</title>
</svelte:head>

<div class="add-initiative-button">
	<a class="add-initiative-href" href="/initiative/create"
		>Add initiative <AddIcon /></a
	>
</div>

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
		padding: 3em;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 2em;
		padding-top: 1em;
	}

	.add-initiative-button {
		display: flex;
		flex-direction: row;

		justify-content: flex-end;
	}

	.add-initiative-href {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 5px;

		cursor: pointer;
		text-decoration: none;
		font-size: 20px;

		margin-top: 3em;
		margin-right: 3em;
		padding: 0.3em 0.5em;

		border: 1px solid var(--text-dark);
		border-radius: 4px;
	}

	.add-initiative-href > :global(svg) {
		height: 1em;
		width: 1em;
	}
</style>

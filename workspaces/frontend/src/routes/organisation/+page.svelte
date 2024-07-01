<script lang="ts">
	import type {EnrichedOrganisation} from '@lusc/initiatives-tracker-util/types.js';

	import {getState} from '../../state.ts';
	import Organisation from '../../components/organisation.svelte';
	import Loading from '../../components/loading.svelte';
	import Initiative from '../../components/initiative.svelte';

	let organisation = getState<EnrichedOrganisation>();
</script>

<div class="organisation">
	{#if organisation}
		<h1 class="name">{organisation.name}</h1>
		<Organisation bind:organisation allowEdit standalone />

		{#if organisation.signatures.length > 0}
			<h1 class="initiatives-title">Initiatives</h1>
			<div class="initiatives">
				{#each organisation.signatures as initiative (initiative.id)}
					<Initiative {initiative} allowEdit={false} standalone={false} />
				{/each}
			</div>
		{/if}
	{:else}
		<Loading />
	{/if}
</div>

<style>
	.organisation {
		width: 100%;
	}

	.initiatives {
		display: flex;
		flex-wrap: wrap;
		gap: 2em;
	}

	.name {
		margin-top: 0;
	}
</style>

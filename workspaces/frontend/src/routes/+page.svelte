<script lang="ts">
	import type {
		EnrichedInitiative,
		ApiResponse,
	} from '@lusc/initiatives-tracker-util/types.js';
	import {browser} from '$app/environment';
	import Initiative from '../components/initiative.svelte';

	let initiatives: EnrichedInitiative[] | undefined;
	let errorMsg: string | undefined;

	async function fetchInitiatives() {
		if (!browser) {
			return;
		}

		let response: Response;
		try {
			response = await fetch('/api/initiatives', {
				redirect: 'error',
			});
		} catch (error: unknown) {
			console.log(error);
			errorMsg = 'Error';
			return;
		}
		if (response.ok) {
			const json = (await response.json()) as ApiResponse<EnrichedInitiative[]>;
			if (json.type === 'success') {
				initiatives = json.data;
				console.log(initiatives);
			} else {
				errorMsg = json.readableError;
			}
		} else {
			errorMsg = await response.text();
		}
	}

	$: fetchInitiatives();
</script>

<svelte:head>
	<title>Initiatives Tracker</title>
</svelte:head>

<div id="index">
	{#if initiatives}
		{#each initiatives as initiative (initiative.id)}
			<Initiative {initiative} />
		{/each}
	{:else if errorMsg}
		<div>Error: {errorMsg}</div>
	{:else}
		<div>Loading</div>
	{/if}
</div>

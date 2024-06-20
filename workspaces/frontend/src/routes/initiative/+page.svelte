<script lang="ts">
	import type {EnrichedInitiative} from '@lusc/initiatives-tracker-util/types.js';

	import {getState} from '../../state.ts';
	import Initiative from '../../components/initiative.svelte';

	const state = getState<EnrichedInitiative>();
</script>

<div class="place-center">
	<div class="initiative-box">
		{#if state}
			<Initiative initiative={state} allowEdit standalone />
		{:else}
			<div>Loading</div>
		{/if}
	</div>
</div>

<style>
	.place-center {
		padding-top: 3em;
		width: 100%;
		display: grid;
		place-items: center;
	}

	.initiative-box {
		max-width: 550px;
		margin: 0 3em;
	}
</style>

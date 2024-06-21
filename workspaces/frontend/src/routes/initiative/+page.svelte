<script lang="ts">
	import type {EnrichedInitiative} from '@lusc/initiatives-tracker-util/types.js';

	import {getState} from '../../state.ts';
	import Initiative from '../../components/initiative.svelte';
	import StandaloneCenter from '../../components/standalone-center.svelte';
	import Loading from '../../components/loading.svelte';

	const state = getState<EnrichedInitiative>();
</script>

<StandaloneCenter>
	{#if state}
		<Initiative initiative={state} allowEdit standalone />
	{:else}
		<Loading />
	{/if}
</StandaloneCenter>

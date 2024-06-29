<script lang="ts">
	import type {EnrichedInitiative} from '@lusc/initiatives-tracker-util/types.js';

	import {getState} from '../../state.ts';
	import Initiative from '../../components/initiative.svelte';
	import StandaloneCenter from '../../components/standalone-center.svelte';
	import Loading from '../../components/loading.svelte';
	import SignedBy from '../../components/initiative/signed-by.svelte';
	import AddSignature from '../../components/initiative/add-signature.svelte';

	let initiative = getState<EnrichedInitiative>();
</script>

<StandaloneCenter>
	{#if initiative}
		<Initiative bind:initiative allowEdit standalone />

		<h1>Signatures</h1>
		<SignedBy bind:initiative />
		<AddSignature bind:initiative />
	{:else}
		<Loading />
	{/if}
</StandaloneCenter>

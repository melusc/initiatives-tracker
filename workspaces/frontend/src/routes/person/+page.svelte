<script lang="ts">
	import type {EnrichedPerson} from '@lusc/initiatives-tracker-util/types.js';

	import Loading from '../../components/loading.svelte';
	import StandaloneCenter from '../../components/standalone-center.svelte';
	import Person from '../../components/person.svelte';
	import {getState} from '../../state.ts';

	const state = getState<EnrichedPerson>();
</script>

<StandaloneCenter>
	{#if state}
		<Person person={state} allowEdit standalone />
	{:else}
		<Loading />
	{/if}
</StandaloneCenter>

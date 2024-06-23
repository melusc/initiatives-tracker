<script lang="ts">
	import type {EnrichedUser} from '@lusc/initiatives-tracker-util/types.js';

	import Loading from '../../components/loading.svelte';
	import StandaloneCenter from '../../components/standalone-center.svelte';
	import User from '../../components/user.svelte';
	import {getState} from '../../state.ts';

	const state = getState<EnrichedUser>();
</script>

<StandaloneCenter>
	{#if state}
		<User user={state} allowEdit standalone />
	{:else}
		<Loading />
	{/if}
</StandaloneCenter>

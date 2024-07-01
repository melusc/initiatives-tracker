<script lang="ts">
	import type {EnrichedOrganisation} from '@lusc/initiatives-tracker-util/types.js';

	import {getState} from '../../state.ts';
	import Loading from '../../components/loading.svelte';
	import CreateButton from '../../components/create-button.svelte';
	import Organisation from '../../components/organisation.svelte';

	const organisations = getState<EnrichedOrganisation[]>();
</script>

<CreateButton text="Create organisation" href="/organisation/create" />

<div class="organisations">
	{#if organisations}
		{#each organisations as organisation (organisation.id)}
			<Organisation {organisation} standalone={false} allowEdit={false} />
		{/each}
	{:else}
		<Loading />
	{/if}
</div>

<style>
	.organisations {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 2em;
	}
</style>

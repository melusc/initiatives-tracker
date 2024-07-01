<script lang="ts">
	import type {EnrichedInitiative} from '@lusc/initiatives-tracker-util/types.js';

	import {getLogin, getState} from '../../state.ts';
	import Initiative from '../../components/initiative.svelte';
	import Loading from '../../components/loading.svelte';
	import SignedBy from '../../components/initiative/signed-by.svelte';
	import AddSignature from '../../components/initiative/add-signature.svelte';
	import AssociatedOrganisations from '../../components/initiative/associated-organisations.svelte';
	import AddOrganisation from '../../components/initiative/add-organisation.svelte';

	let initiative = getState<EnrichedInitiative>();

	const login = getLogin();
</script>

<div class="initiative">
	{#if initiative}
		<h1 class="name">{initiative.shortName}</h1>
		<Initiative bind:initiative allowEdit standalone />

		<h1>Signatures</h1>
		<SignedBy bind:initiative />
		<AddSignature bind:initiative />

		{#if login?.isAdmin}
			<h1>Organisations</h1>
			<AssociatedOrganisations bind:initiative />
			<AddOrganisation bind:initiative />
		{:else if initiative.organisations.length > 0}
			<h1>Organisations</h1>
			<AssociatedOrganisations bind:initiative />
		{/if}
	{:else}
		<Loading />
	{/if}
</div>

<style>
	.initiative {
		width: 100%;
	}

	.name {
		margin-top: 0;
	}
</style>

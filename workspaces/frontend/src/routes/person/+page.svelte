<script lang="ts">
	import type {EnrichedPerson} from '@lusc/initiatives-tracker-util/types.js';

	import Loading from '../../components/loading.svelte';
	import {getLogin, getState} from '../../state.ts';
	import EditableTitle from '../../components/editable-title.svelte';
	import Initiative from '../../components/initiative.svelte';

	let person = getState<EnrichedPerson>();
	const login = getLogin();
</script>

<div class="person" data-person={person?.id}>
	{#if person}
		<EditableTitle
			bind:subject={person}
			canEdit={login?.isAdmin ?? false}
			patchApi={`/api/person/${person.id}`}
		/>

		{#if person?.initiatives.length > 0}
			<h1>Signed Initiatives</h1>
			<div class="signed-initiatives">
				{#each person.initiatives as initiative (initiative.id)}
					<Initiative {initiative} allowEdit={false} standalone={false} />
				{/each}
			</div>
		{/if}
	{:else}
		<Loading />
	{/if}
</div>

<style>
	.person {
		padding: 3em;
	}

	.signed-initiatives {
		padding: 3em;
		display: flex;
		flex-wrap: wrap;
		gap: 1em;
	}
</style>

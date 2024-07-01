<script lang="ts">
	import type {EnrichedPerson} from '@lusc/initiatives-tracker-util/types.js';

	import Loading from '../../components/loading.svelte';
	import {getState} from '../../state.ts';
	import EditableTitle from '../../components/person/editable-title.svelte';
	import Initiative from '../../components/initiative.svelte';
	import DeleteButton from '../../components/delete-button.svelte';

	let person = getState<EnrichedPerson>();
</script>

<div class="person" data-person={person?.id}>
	{#if person}
		<EditableTitle bind:subject={person} patchApi="/api/person/{person.id}" />

		{#if person?.initiatives.length > 0}
			<h1>Signed Initiatives</h1>
			<div class="signed-initiatives">
				{#each person.initiatives as initiative (initiative.id)}
					<Initiative {initiative} allowEdit={false} standalone={false} />
				{/each}
			</div>
		{/if}

		<DeleteButton
			api="/api/person/{person.id}"
			name={person.name}
			nonAdminAllowed
		/>
	{:else}
		<Loading />
	{/if}
</div>

<style>
	.signed-initiatives {
		display: flex;
		flex-wrap: wrap;
		gap: 1em;

		margin-bottom: 2em;
	}
</style>

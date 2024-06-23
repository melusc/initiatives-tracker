<script lang="ts">
	import type {EnrichedPerson} from '@lusc/initiatives-tracker-util/types.js';

	import Loading from '../../components/loading.svelte';
	import {getLogin, getState} from '../../state.ts';
	import EditableTitle from '../../components/editable-title.svelte';

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
	{:else}
		<Loading />
	{/if}
</div>

<style>
	.person {
		padding: 3em;
	}
</style>

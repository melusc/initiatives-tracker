<script lang="ts">
	import type {EnrichedPerson} from '@lusc/initiatives-tracker-util/types.js';

	import {getState} from '../../state.ts';
	import Loading from '../../components/loading.svelte';
	import UserIcon from '../../components/user-icon.svelte';
	import CreateButton from '../../components/create-button.svelte';

	const people = getState<EnrichedPerson[]>();
</script>

<CreateButton text="Create person" href="/person/create" />

<div class="people">
	{#if people}
		<div class="table">
			<div class="thead">
				<div class="cell" />
				<div class="cell">Name</div>
				<div class="cell">No. signed initiatives</div>
			</div>
			{#each people as person (person.id)}
				<a href="/person/{person.id}" class="href">
					<div class="cell">
						<UserIcon name={person.name} iconKey={person.id} />
					</div>
					<div class="cell">{person.name}</div>
				</a>
				<div class="cell">{person.initiatives.length}</div>
			{/each}
		</div>
	{:else}
		<Loading />
	{/if}
</div>

<style>
	.people {
		padding: 3em;
		padding-top: 0;
	}

	.table {
		display: grid;
		grid-template-columns: repeat(3, max-content);
		width: max-content;

		place-items: center;
		row-gap: 5px;
		column-gap: 1em;
	}

	.thead {
		font-weight: bold;
		display: contents;
	}

	.cell {
		text-align: start;
		width: 100%;
	}

	a > .cell {
		text-decoration: underline;
	}

	.href {
		display: contents;
	}
</style>

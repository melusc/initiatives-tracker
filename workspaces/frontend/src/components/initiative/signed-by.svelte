<script lang="ts">
	import {type EnrichedInitiative} from '@lusc/initiatives-tracker-util/types.js';

	import UserIcon from '../user-icon.svelte';
	import Trash from '../icons/trash.svelte';

	export let initiative: EnrichedInitiative;

	function handleKeyboardRemove(id: string): (event: KeyboardEvent) => void {
		return (event: KeyboardEvent) => {
			if (event.key === 'Enter' || event.key === ' ') {
				void removeById(id);
			}
		};
	}

	async function removeById(id: string): Promise<void> {
		const response = await fetch(
			'/api/initiative/' + initiative.id + '/sign/' + id,
			{method: 'delete'},
		);

		if (response.ok) {
			initiative.signatures = initiative.signatures.filter(
				person => person.id !== id,
			);
		}
	}

	function handleClickRemove(id: string): () => void {
		return () => {
			void removeById(id);
		};
	}
</script>

{#if initiative.signatures.length > 0}
	{@const people = initiative.signatures}
	<div class="signed-by">
		{#each people as person (person.id)}
			<div class="signer">
				<a class="user-icon" href="/person/{person.id}">
					<UserIcon name={person.name} iconKey={person.id} />
				</a>
				<div
					class="trash"
					on:click={handleClickRemove(person.id)}
					on:keydown={handleKeyboardRemove(person.id)}
					role="button"
					tabindex="0"
				>
					<Trash />
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.signed-by {
		margin-top: 1em;

		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}

	.signer {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
	}

	.user-icon {
		grid-row: 1;
		grid-column: 1;
	}

	.trash {
		display: none;

		height: 1.5em;
		width: 1.5em;
		grid-row: 1;
		grid-column: 1;
		align-self: start;
		justify-self: end;
		color: var(--error);
		background: white;
		border-radius: 50%;
		place-items: center;
		padding: 4px;
		border: 1px solid var(--error);
		cursor: pointer;
	}

	.signer:hover > .trash {
		display: grid;
	}
</style>

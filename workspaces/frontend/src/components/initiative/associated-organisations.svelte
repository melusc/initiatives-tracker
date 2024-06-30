<script lang="ts">
	import {type EnrichedInitiative} from '@lusc/initiatives-tracker-util/types.js';

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
			'/api/initiative/' + initiative.id + '/organisation/' + id,
			{method: 'delete'},
		);

		if (response.ok) {
			initiative.organisations = initiative.organisations.filter(
				organisation => organisation.id !== id,
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
	{@const {organisations} = initiative}
	<div class="associated-organisations">
		{#each organisations as organisation (organisation.id)}
			<div class="signer">
				<a
					class="organisation-image-href"
					href={`/organisation/${organisation.id}`}
				>
					<img class="organisation-image" src={organisation.imageUrl} alt="" />
				</a>
				<div
					class="trash"
					on:click={handleClickRemove(organisation.id)}
					on:keydown={handleKeyboardRemove(organisation.id)}
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
	.associated-organisations {
		margin-top: 1em;

		display: flex;
		flex-wrap: wrap;
		gap: 2em;
		place-items: center;
	}

	.signer {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
	}

	.organisation-image-href {
		grid-row: 1;
		grid-column: 1;
	}

	.organisation-image {
		max-height: 4em;
		max-width: 200px;
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

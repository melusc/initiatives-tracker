<script lang="ts">
	import type {EnrichedUser} from '@lusc/initiatives-tracker-util/types.js';

	import {getUser} from '../state.ts';

	import Card from './card.svelte';
	import CreateIcon from './icons/create.svelte';
	import TrashIcon from './icons/trash.svelte';
	import PatchInput from './patch-input.svelte';

	export let user: EnrichedUser;

	export let allowEdit: boolean;
	export let standalone: boolean;

	const login = getUser();

	let showEdit = false;

	function handleEditToggle(): void {
		showEdit = !showEdit;
	}

	async function deleteInitiative(): Promise<void> {
		await fetch(`/api/user/${user.id}`, {method: 'delete'});
		location.href = '/';
	}
</script>

<Card>
	{#if allowEdit && login?.isAdmin}
		<button
			class="toggle-edit inline-svg button-reset"
			on:click={handleEditToggle}
		>
			{showEdit ? 'Back' : 'Edit'}
			<CreateIcon />
		</button>
	{/if}

	{#if showEdit}
		<PatchInput
			name="name"
			label="Name"
			type="text"
			bind:value={user.name}
			apiEndpoint={`/api/user/${user.id}`}
		/>
	{:else}
		<div class="name">{user.name}</div>
	{/if}

	{#if standalone}
		<button class="delete inline-svg button-reset" on:click={deleteInitiative}>
			Delete "{user.name}" <TrashIcon />
		</button>
	{/if}
</Card>

<style>
	.inline-svg {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 5px;
	}

	.inline-svg > :global(svg) {
		height: 1em;
		width: 1em;
	}

	.button-reset {
		background: none;
		font: inherit;
		border: none;
		cursor: pointer;
		padding-left: 0;
	}

	.name {
		font-size: 1.3em;
	}

	.delete {
		color: var(--text-light);
		background: var(--error);
		box-shadow: var(--box-shadow);
		border-radius: 5px;
		padding: 0.3em 0.6em;
		margin-top: 1em;

		transition: 100ms ease-in-out scale;
	}

	.delete:active {
		scale: 0.97;
	}
</style>

<script lang="ts">
	import type {Organisation} from '@lusc/initiatives-tracker-util/types.js';

	import {getLogin} from '../state.ts';

	import PatchInput from './patch-input.svelte';
	import CreateIcon from './icons/create.svelte';
	import ExternalLinkIcon from './icons/external-link.svelte';
	import TrashIcon from './icons/trash.svelte';
	import Card from './card.svelte';

	export let organisation: Organisation;

	export let allowEdit: boolean;
	export let standalone: boolean;

	const login = getLogin();

	let showEdit = false;

	function handleEditToggle(): void {
		showEdit = !showEdit;
	}

	let confirm = false;
	async function deleteOrganisation(): Promise<void> {
		if (confirm) {
			await fetch(`/api/organisation/${organisation.id}`, {method: 'delete'});
			location.href = '/';
		} else {
			confirm = true;
		}
	}

	// eslint-disable-next-line @typescript-eslint/ban-types
	function transformOptional(s: string): string | null {
		return s.trim() === '' ? null : s;
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
			bind:value={organisation.name}
			apiEndpoint={`/api/organisation/${organisation.id}`}
		/>
		<PatchInput
			name="imageUrl"
			label="Image URL"
			type="text"
			transform={transformOptional}
			bind:value={organisation.imageUrl}
			apiEndpoint={`/api/organisation/${organisation.id}`}
		/>
		<PatchInput
			name="website"
			label="Website"
			type="text"
			transform={transformOptional}
			bind:value={organisation.website}
			apiEndpoint={`/api/organisation/${organisation.id}`}
		/>
		{#if organisation.imageUrl}
			<img class="image-url" src={organisation.imageUrl} alt="" />
		{/if}
	{:else}
		<a
			href={standalone ? undefined : `/organisation/${organisation.id}`}
			class="short-name">{organisation.name}</a
		>
		{#if organisation.website}
			<a
				class="website inline-svg"
				href={organisation.website}
				rel="nofollow noreferrer noopener"
				target="_blank"
			>
				Website <ExternalLinkIcon />
			</a>
		{/if}
		{#if organisation.imageUrl}
			<a href={standalone ? undefined : `/organisation/${organisation.id}`}>
				<img class="image-url" src={organisation.imageUrl} alt="" />
			</a>
		{/if}
	{/if}

	{#if standalone}
		<button
			class="delete inline-svg button-reset"
			on:click={deleteOrganisation}
		>
			{#if confirm}
				Press again to confirm
			{:else}
				Delete "{organisation.name}"
			{/if}
			<TrashIcon />
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

	.image-url {
		max-width: 100%;
		max-height: 6em;
	}

	.short-name {
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

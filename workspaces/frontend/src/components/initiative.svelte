<script lang="ts">
	import type {Initiative} from '@lusc/initiatives-tracker-util/types.js';

	import {getLogin} from '../state.ts';

	import PatchInput from './patch-input.svelte';
	import CreateIcon from './icons/create.svelte';
	import ExternalLinkIcon from './icons/external-link.svelte';
	import Card from './card.svelte';
	import Calendar from './icons/calendar.svelte';
	import DeleteButton from './delete-button.svelte';
	import PatchInputFile from './patch-input-file.svelte';

	export let initiative: Initiative;

	export let allowEdit: boolean;
	export let standalone: boolean;

	const login = getLogin();

	let showEdit = false;

	function handleEditToggle(): void {
		showEdit = !showEdit;
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
			name="shortName"
			label="Short name"
			type="text"
			bind:value={initiative.shortName}
			apiEndpoint="/api/initiative/{initiative.id}"
		/>
		<PatchInput
			name="fullName"
			label="Full name"
			type="text"
			bind:value={initiative.fullName}
			apiEndpoint="/api/initiative/{initiative.id}"
		/>
		<PatchInput
			name="deadline"
			label="Deadline"
			type="date"
			bind:value={initiative.deadline}
			apiEndpoint="/api/initiative/{initiative.id}"
		/>
		<PatchInput
			name="website"
			label="Website"
			type="text"
			bind:value={initiative.website}
			apiEndpoint="/api/initiative/{initiative.id}"
		/>
		<PatchInputFile
			name="pdf"
			label="PDF Url"
			bind:value={initiative.pdf}
			initialValue=""
			apiEndpoint="/api/initiative/{initiative.id}"
		/>
		<PatchInputFile
			name="image"
			label="Image Url"
			bind:value={initiative.image}
			initialValue=""
			apiEndpoint="/api/initiative/{initiative.id}"
		/>
		<img class="image-url" src={initiative.image} alt="" />
	{:else}
		<a
			href={standalone ? undefined : `/initiative/${initiative.id}`}
			class="short-name">{initiative.shortName}</a
		>
		<div class="full-name">{initiative.fullName}</div>
		<div class="deadline inline-svg"><Calendar /> {initiative.deadline}</div>
		<a
			class="website inline-svg"
			href={initiative.website}
			rel="nofollow noreferrer noopener"
			target="_blank"
		>
			Initiative website <ExternalLinkIcon />
		</a>
		<a class="pdf-url" href={initiative.pdf}>Download initiative as PDF</a>
		<a href={standalone ? initiative.website : `/initiative/${initiative.id}`}>
			<img class="image-url" src={initiative.image} alt="" />
		</a>
	{/if}

	{#if standalone}
		<DeleteButton
			api="/api/initiative/{initiative.id}"
			name={initiative.shortName}
		/>
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
		height: 6em;
		object-fit: contain;
	}

	.short-name {
		font-size: 1.3em;
	}

	.full-name,
	.deadline {
		font-size: 0.8em;
		max-width: 30ch;
	}
</style>

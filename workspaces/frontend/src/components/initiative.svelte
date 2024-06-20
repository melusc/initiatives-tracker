<script lang="ts">
	import type {Initiative} from '@lusc/initiatives-tracker-util/types.js';
	import {getUser} from '../state.ts';
	import PatchInput from './patch-input.svelte';
	import CreateOutline from './icons/create-outline.svelte';

	export let initiative: Initiative;

	export let allowEdit: boolean;
	export let standalone: boolean;

	const user = getUser();

	let showEdit = false;

	function handleEditToggle() {
		showEdit = !showEdit;
	}
</script>

<div class="initiative" data-initiative-id={initiative.id}>
	{#if allowEdit && user?.isAdmin}
		<button class="toggle-edit" on:click={handleEditToggle}>
			{showEdit ? 'Back' : 'Edit'}
			<CreateOutline />
		</button>
	{/if}

	{#if showEdit}
		<PatchInput
			name="shortName"
			label="Short name"
			type="text"
			bind:value={initiative.shortName}
			apiEndpoint={`/api/initiative/${initiative.id}`}
		/>
		<PatchInput
			name="fullName"
			label="Full name"
			type="text"
			bind:value={initiative.fullName}
			apiEndpoint={`/api/initiative/${initiative.id}`}
		/>
		<PatchInput
			name="website"
			label="Website"
			type="text"
			bind:value={initiative.website}
			apiEndpoint={`/api/initiative/${initiative.id}`}
		/>
		<PatchInput
			name="pdfUrl"
			label="PDF Url"
			type="text"
			bind:value={initiative.pdfUrl}
			initialValue=""
			apiEndpoint={`/api/initiative/${initiative.id}`}
		/>
		<PatchInput
			name="imageUrl"
			label="Image Url"
			type="text"
			bind:value={initiative.imageUrl}
			initialValue=""
			apiEndpoint={`/api/initiative/${initiative.id}`}
		/>
		<img class="image-url" src={initiative.imageUrl} alt="" />
	{:else}
		<a
			href={standalone ? undefined : `/initiative/${initiative.id}`}
			class="short-name">{initiative.shortName}</a
		>
		<div class="full-name">{initiative.fullName}</div>
		<a
			class="website"
			href={initiative.website}
			rel="nofollow noreferrer noopener">Initiative website</a
		>
		<a class="pdf-url" href={initiative.pdfUrl}>Download initiative as PDF</a>
		<a href={standalone ? undefined : `/initiative/${initiative.id}`}>
			<img class="image-url" src={initiative.imageUrl} alt="" />
		</a>
	{/if}
</div>

<style>
	.toggle-edit > :global(svg) {
		height: 1em;
		width: 1em;
	}

	.toggle-edit {
		border: var(--theme-primary);
		background: none;
		font: inherit;
		padding: 0;
	}

	.initiative {
		display: flex;
		flex-direction: column;
		width: max-content;
		align-items: flex-start;
		gap: 1em;
		box-shadow: var(--box-shadow);
		border-radius: 1em;
		padding: 2em 3em;
		background: var(--theme-primary);
		color: var(--text-light);
		font-size: 1.3em;
		width: 100%;
	}

	.image-url {
		width: 230px;
		max-width: 100%;
	}

	.short-name {
		font-size: 1.3em;
	}

	.full-name {
		font-size: 0.8em;
	}
</style>

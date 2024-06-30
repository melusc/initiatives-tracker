<script lang="ts">
	import TrashIcon from './icons/trash.svelte';

	export let api: string;
	export let name: string;

	let confirmed = false;
	async function deleteOrganisation(): Promise<void> {
		if (confirmed) {
			await fetch(api, {method: 'delete'});
			location.href = '/';
		} else {
			confirmed = true;
		}
	}
</script>

<button class="delete inline-svg button-reset" on:click={deleteOrganisation}>
	{#if confirmed}
		Press again to confirm
	{:else}
		Delete "{name}"
	{/if}
	<TrashIcon />
</button>

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

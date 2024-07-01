<script lang="ts">
	import {getLogin} from '../state.ts';

	import AddIcon from './icons/add.svelte';

	export let text: string;
	export let href: string;
	export let nonAdminAllowed = false;

	const login = getLogin();
</script>

{#if nonAdminAllowed || login?.isAdmin}
	<div class="button">
		<a class="href" {href}>{text} <AddIcon /></a>
	</div>
{/if}

<style>
	.button {
		display: flex;
		flex-direction: row;

		justify-content: flex-end;
		padding-bottom: 2em;
	}

	.href {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 5px;

		cursor: pointer;
		text-decoration: none;
		font-size: 20px;

		padding: 0.3em 0.5em;

		border: 1px solid var(--text-dark);
		border-radius: 4px;
	}

	.href > :global(svg) {
		height: 1em;
		width: 1em;
	}
</style>

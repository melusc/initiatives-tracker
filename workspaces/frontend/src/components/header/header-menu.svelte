<script lang="ts">
	import {fly} from 'svelte/transition';

	import X from '../icons/x.svelte';

	export let close: () => void;

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter' || event.key === ' ') {
			close();
		}
	}
</script>

<div
	class="background"
	on:click={close}
	on:touchend={close}
	aria-hidden="true"
/>

<div
	class="header-menu"
	in:fly={{
		x: '110%',
	}}
	out:fly={{
		x: '110%',
	}}
>
	<div class="top-row">
		<a href="/account">
			<slot name="user-icon" />
		</a>
		<div
			on:click={close}
			on:keydown={handleKeydown}
			role="button"
			tabindex="0"
			class="close"
		>
			<X />
		</div>
	</div>

	<div class="hr" />
	<a href="/">Initiatives</a>
	<a href="/users">Users</a>
	<a href="/organisations">Organisations</a>

	<div class="hr" />
	<a href="/account">Account</a>
	<a href="/logout">Logout</a>
</div>

<style>
	.background {
		position: absolute;
		top: 0;
		left: 0;
		height: 100vh;
		width: 100vw;
	}

	.header-menu {
		border-radius: 1em;
		box-shadow: var(--box-shadow);

		position: absolute;
		right: 0;
		top: 0;

		padding: 1em 0;

		height: 100%;

		width: calc(1em + max-content);

		background: white;

		display: flex;
		flex-direction: column;
		gap: 0.5em;
		align-items: flex-start;
	}

	a {
		font-size: 1.3em;
	}

	.header-menu > * {
		margin: 0 2em;
	}

	.hr {
		width: 100%;
		border-top: 1px solid #4449;
		margin: 0;
	}

	.close {
		width: 2em;
		height: 2em;

		cursor: pointer;
	}

	.top-row {
		display: flex;
		flex-direction: row;
		gap: 0.8em;
		align-items: center;

		margin-top: 1em;
		margin-bottom: 1em;
	}
</style>

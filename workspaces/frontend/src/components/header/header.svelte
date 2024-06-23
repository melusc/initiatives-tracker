<script lang="ts">
	import {RelativeUrl} from '@lusc/initiatives-tracker-util/relative-url.js';

	import UserIcon from '../user-icon.svelte';
	import {getLogin} from '../../state.ts';

	import HeaderMenu from './header-menu.svelte';

	import {browser} from '$app/environment';

	const loginInfo = getLogin();

	let showMenu = false;

	const loginLink = new RelativeUrl('/login');
	const currentLink = new RelativeUrl(browser ? location.href : '/');
	if (currentLink.path === '/login') {
		loginLink.searchParams.set('redirect', '/');
	} else {
		loginLink.searchParams.set('redirect', currentLink.full);
	}

	function toggleMenu(event: MouseEvent | KeyboardEvent): void {
		if (event.type === 'keydown') {
			const keyEvent = event as KeyboardEvent;
			if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
				showMenu = !showMenu;
			}
		} else {
			showMenu = !showMenu;
		}
	}

	function headerMenuClose(): void {
		showMenu = false;
	}
</script>

<header>
	<a href="/">
		<h1>Initiatives Tracker</h1>
	</a>

	<div class="header-nav">
		<a href="/">Initiatives</a>
		<a href="/people">People</a>
		<a href="/organisations">Organisations</a>
	</div>

	{#if loginInfo}
		<div
			class="user-icon-action"
			role="button"
			tabindex="0"
			on:click={toggleMenu}
			on:keydown={toggleMenu}
		>
			<UserIcon userId={loginInfo.iconKey} />
		</div>
	{:else}
		<a href={loginLink.full} class="login">Login</a>
	{/if}
</header>

{#if showMenu}
	<HeaderMenu close={headerMenuClose}>
		<div slot="user-icon" class="user-info">
			{#if loginInfo}
				<UserIcon userId={loginInfo.iconKey} />
				<span>{loginInfo.name}</span>
			{/if}
		</div>
	</HeaderMenu>
{/if}

<style>
	header {
		width: 100%;
		padding: 1em;
		display: grid;

		display: flex;
		flex-direction: row;
		align-items: center;

		gap: 2em;

		background-color: var(--theme-primary);

		user-select: none;
		box-shadow: var(--box-shadow);

		color: var(--text-light);
	}

	.user-icon-action {
		cursor: pointer;
		margin-left: auto;
	}

	h1 {
		margin: 0;
	}

	a {
		font-weight: 600;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	.header-nav {
		display: contents;
	}

	.login {
		margin-left: auto;
	}

	@media (width <= 650px) {
		header {
			grid-template-columns: 3fr 1fr;
		}
		.user-icon-action {
			grid-column: 2;
		}
		.header-nav {
			display: none !important;
		}
	}
</style>

<script lang="ts">
	import {getState} from '../../state.ts';

	const state = getState<{error?: string}>();
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<div class="login-form-center">
	<form method="POST">
		<label>
			Username
			<input type="text" name="username" minlength="4" />
		</label>
		<label>
			Password
			<input type="password" name="password" minlength="12" />
		</label>
		{#if state?.error === 'incorrect-credentials'}
			<div class="error">Incorrect credentials. Please try again.</div>
		{:else if state?.error === 'missing-values'}
			<div class="error">Please fill in all fields.</div>
		{/if}
		<input type="submit" value="Submit" />
	</form>
</div>

<style>
	.login-form-center {
		width: 100vw;
		display: grid;
		place-items: center;
		margin-top: 3em;
	}

	form {
		display: flex;
		flex-direction: column;
		width: max-content;
		gap: 1em;
		background: var(--theme-primary);
		color: var(--text-light);
		padding: 2em 3em;
		border-radius: 1em;
		font-size: 1.2em;

		box-shadow: var(--box-shadow);
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	input {
		background: none;
		border: 1px solid currentColor;
		color: inherit;
		border-radius: 2px;
		padding: 0.3em 10px;
		font: inherit;
	}

	.error {
		font-size: 1.2em;
		font-weight: 600;
	}
</style>

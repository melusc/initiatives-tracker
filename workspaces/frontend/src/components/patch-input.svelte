<script lang="ts">
	import type {ApiResponse} from '@lusc/initiatives-tracker-util/types.js';
	import {slide} from 'svelte/transition';

	import SaveIcon from './icons/save.svelte';

	export let type: 'text' | 'url';
	export let name: string;
	export let label: string;
	export let apiEndpoint: string;

	export let value: string;
	export let initialValue = value;
	let node: HTMLInputElement;

	let error: undefined | string = undefined;
	let errorTimeout: ReturnType<typeof setTimeout> | undefined;

	function setError(newError: undefined | string): void {
		if (errorTimeout) {
			clearTimeout(errorTimeout);
			errorTimeout = undefined;
		}

		if (newError !== undefined) {
			errorTimeout = setTimeout(() => {
				setError(undefined);
			}, 10e3);
		}

		error = newError;
	}

	let submitSuccessful: true | undefined;
	let submitSuccessfulTimeout: ReturnType<typeof setTimeout> | undefined;
	function setSubmitSuccessful(newSuccess: true | undefined): void {
		// Resetting it:
		// Do that instantly, remove timeout
		if (!newSuccess && submitSuccessfulTimeout) {
			clearTimeout(submitSuccessfulTimeout);
			submitSuccessfulTimeout = undefined;
			submitSuccessful = newSuccess;
		}

		// Setting it to true if it was already set:
		// First reset it for 200ms, and only then set it again
		if (newSuccess && submitSuccessfulTimeout) {
			clearTimeout(submitSuccessfulTimeout);
			submitSuccessful = undefined;
			submitSuccessfulTimeout = setTimeout(() => {
				submitSuccessfulTimeout = undefined;
				setSubmitSuccessful(true);
			}, 200);
		} else if (newSuccess) {
			// Otherwise just set it instantly and remove again after 5s
			submitSuccessful = true;

			submitSuccessfulTimeout = setTimeout(() => {
				submitSuccessful = undefined;
				submitSuccessfulTimeout = undefined;
			}, 5e3);
		}
	}

	async function handleSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault();

		const response = await fetch(apiEndpoint, {
			method: 'PATCH',
			body: new URLSearchParams([[name, node.value]]),
		});
		const body = (await response.json()) as ApiResponse<Record<string, string>>;

		if (body.type === 'error') {
			setSubmitSuccessful(undefined);
			setError(body.readableError);
		} else {
			setError(undefined);
			value = body.data[name]!;
			setSubmitSuccessful(true);
		}
	}
</script>

<form on:submit={handleSubmit}>
	<label for={name}>
		{label}
	</label>
	{#if error}
		<div in:slide out:slide class="error">{error}</div>
	{/if}

	<div class="input-wrap">
		<input
			class:error={Boolean(error)}
			class:success={submitSuccessful}
			{type}
			{name}
			value={initialValue ?? value}
			on:input
			bind:this={node}
		/><!--
			--><button
			class:error={Boolean(error)}
			class:success={submitSuccessful}
			type="submit"
		>
			<SaveIcon />
		</button>
	</div>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 0.3em;
		width: 100%;
	}

	button > :global(svg) {
		height: 1em;
		width: 1em;
	}

	.input-wrap {
		display: flex;
		flex-direction: row;
		gap: 0;
		height: max-content;
	}

	button,
	input {
		transition:
			0.4s ease-out border-color,
			0.4s ease-out color;

		padding: 0.3em 0.5em;
		border: 1px solid var(--text-light);
		background: #fff;
		color: var(--text-dark);
	}

	input {
		border-radius: 0.5em 0 0 0.5em;
		border-right: none;
		width: 100%;

		margin-right: 0;
	}

	button {
		border-left: none;
		border-radius: 0 0.5em 0.5em 0;

		margin-left: 0;
		padding-left: 0;

		cursor: pointer;
	}

	button.error,
	input.error {
		border-color: var(--error);
		color: var(--error);
	}

	button.success,
	input.success {
		border-color: var(--success);
		color: var(--success);
	}

	.error,
	.success {
		transition: none;
	}
</style>

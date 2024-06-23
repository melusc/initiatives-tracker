<script lang="ts">
	import type {ApiResponse} from '@lusc/initiatives-tracker-util/types.js';
	import {slide} from 'svelte/transition';

	import {createSuccessState} from '../success-state.ts';

	import SaveIcon from './icons/save.svelte';

	export let type: 'text' | 'url' | 'date';
	export let name: string;
	export let label: string;
	export let apiEndpoint: string;

	export let value: string;
	export let initialValue = value;
	let node: HTMLInputElement;

	const successState = createSuccessState();

	async function handleSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault();

		const response = await fetch(apiEndpoint, {
			method: 'PATCH',
			body: new URLSearchParams([[name, node.value]]),
		});
		const body = (await response.json()) as ApiResponse<Record<string, string>>;

		if (body.type === 'error') {
			successState.setError(body.readableError);
		} else {
			value = body.data[name]!;
			successState.setSuccess();
		}
	}
</script>

<form on:submit={handleSubmit}>
	<label for={name}>
		{label}
	</label>
	{#if $successState?.type === 'error'}
		<div in:slide out:slide class="error">{$successState.error}</div>
	{/if}

	<div class="input-wrap">
		<input
			class:error={$successState?.type === 'error'}
			class:success={$successState?.type === 'success'}
			{type}
			{name}
			value={initialValue ?? value}
			on:input
			bind:this={node}
		/><!--
			--><button
			class:error={$successState?.type === 'error'}
			class:success={$successState?.type === 'success'}
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
		font-size: 0.8em;
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

		display: flex;
		justify-content: center;
		align-items: center;
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

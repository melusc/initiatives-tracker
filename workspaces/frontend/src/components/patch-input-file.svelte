<script lang="ts">
	import type {ApiResponse} from '@lusc/initiatives-tracker-util/types.js';
	import {slide} from 'svelte/transition';

	import {createSuccessState} from '../success-state.ts';

	import SaveIcon from './icons/save.svelte';
	import UploadIcon from './icons/upload.svelte';
	import TrashIcon from './icons/trash.svelte';

	export let name: string;
	export let label: string;
	export let apiEndpoint: string;

	// eslint-disable-next-line @typescript-eslint/ban-types
	export let value: string | null;

	let file: File | undefined;
	let formElement: HTMLFormElement;
	let fileInputElement: HTMLInputElement;

	export let initialValue = value;
	let node: HTMLInputElement;

	const successState = createSuccessState();

	function clickUpload(): void {
		if (file) {
			file = undefined;
			formElement.reset();
		} else {
			fileInputElement.click();
		}
	}

	function handleFileInput(): void {
		file = fileInputElement.files?.item(0) ?? undefined;
	}

	async function handleSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault();

		const patchBody = new FormData();
		patchBody.set(name, file ?? node.value);

		const response = await fetch(apiEndpoint, {
			method: 'PATCH',
			body: patchBody,
		});
		const body = (await response.json()) as ApiResponse<Record<string, string>>;

		if (body.type === 'error') {
			successState.setError(body.readableError);
		} else {
			formElement.reset();
			file = undefined;
			value = body.data[name]!;
			successState.setSuccess();
		}
	}
</script>

<form on:submit={handleSubmit} bind:this={formElement}>
	<label for={name}>
		{label}
	</label>
	{#if $successState?.type === 'error'}
		<div in:slide out:slide class="error">{$successState.error}</div>
	{/if}

	<div class="input-wrap">
		{#if file}
			<input
				class:error={$successState?.type === 'error'}
				class:success={$successState?.type === 'success'}
				type="text"
				value={file.name}
				readonly
			/>
		{:else}
			<input
				class:error={$successState?.type === 'error'}
				class:success={$successState?.type === 'success'}
				type="url"
				{name}
				value={initialValue ?? value}
				on:input
				bind:this={node}
			/>{/if}
		<button
			class:error={$successState?.type === 'error'}
			class:success={$successState?.type === 'success'}
			type="button"
			on:click={clickUpload}
		>
			{#if file}
				<TrashIcon />
			{:else}
				<UploadIcon />
			{/if}
		</button>
		<input
			class="hidden"
			type="file"
			on:input={handleFileInput}
			bind:this={fileInputElement}
		/>
		<button
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

	.hidden {
		display: none;
	}
</style>

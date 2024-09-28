<!--
Copyright (C) 2024  Luca Schnellmann

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->

<script lang="ts" generics="T extends {name: string}">
	import type {ApiResponse} from '@lusc/initiatives-tracker-util/types.js';
	import {afterUpdate} from 'svelte';
	import {slide} from 'svelte/transition';

	import {createSuccessState} from '../../success-state.ts';
	import CreateIcon from '../icons/create.svelte';
	import Save from '../icons/save.svelte';

	export let subject: T;
	export let patchApi: string;

	const successState = createSuccessState();

	let titleNode: HTMLHeadingElement;
	let editEnabled = false;

	afterUpdate(() => {
		if (editEnabled) {
			const range = document.createRange();
			range.selectNodeContents(titleNode);
			range.collapse(false);
			const selection = getSelection()!;
			selection.removeAllRanges();
			selection.addRange(range);
		}
	});

	function enableEdit(): void {
		editEnabled = true;
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter') {
			event.preventDefault();
			event.stopImmediatePropagation();
			void handleSave();
		}
	}

	async function handleSave(): Promise<void> {
		const requestBody = new URLSearchParams();
		requestBody.set('name', titleNode.textContent!);

		const response = await fetch(patchApi, {
			method: 'PATCH',
			body: requestBody,
		});
		const body = (await response.json()) as ApiResponse<T>;

		if (body.type === 'error') {
			successState.setError(body.readableError);
		} else {
			successState.setSuccess();
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			subject = body.data;
			editEnabled = false;

			// If name is normalised or otherwise modified on server
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			titleNode.textContent = subject.name;
		}
	}
</script>

<div class="title">
	<h1
		class:success={$successState?.type === 'success'}
		class:error={$successState?.type === 'error'}
		bind:this={titleNode}
		contenteditable={editEnabled}
		on:keydown={handleKeydown}
	>
		{subject.name}
	</h1>

	{#if editEnabled}
		<button
			class="save inline-svg remove-style"
			type="submit"
			class:success={$successState?.type === 'success'}
			class:error={$successState?.type === 'error'}
			on:click={handleSave}
		>
			<Save />
		</button>
	{:else}
		<button
			class="enable-edit inline-svg remove-style"
			class:success={$successState?.type === 'success'}
			class:error={$successState?.type === 'error'}
			on:click={enableEdit}><CreateIcon /></button
		>
	{/if}
</div>

{#if $successState?.type === 'error'}
	<div class="error" in:slide out:slide>{$successState.error}</div>
{/if}

<style>
	h1 {
		padding-right: 5px;
		margin: 0;
		transition: 0.4s ease-out color;

		white-space: pre;
	}

	.success {
		color: var(--success);
	}

	.error {
		color: var(--error);
	}

	.success,
	.error {
		transition: none;
	}

	.title {
		display: flex;
		align-items: center;
		margin-bottom: 1em;
		color: var(--theme-primary);
	}

	.remove-style {
		cursor: pointer;
		background: none;
		border: none;
	}

	.inline-svg > :global(svg) {
		width: 1.6em;
		height: 1.6em;
	}
</style>

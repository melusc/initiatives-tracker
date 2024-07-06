<script context="module" lang="ts">
	export type Input = {
		name: string;
		label: string;
		type: string;
		minlength: number;
		required?: boolean;
	};
</script>

<script lang="ts">
	import {getState} from '../../state.ts';
	import Card from '../card.svelte';
	import StandaloneCenter from '../standalone-center.svelte';

	import FileInput from './file-input.svelte';

	export let title: string;

	export let inputs: Input[];

	const {
		error,
		values,
	}: {
		error?: string;
		values: Record<string, string>;
	} = getState() ?? {values: {}};
</script>

<StandaloneCenter>
	<form method="POST" enctype="multipart/form-data">
		<Card>
			<h1>{title}</h1>
			{#if error}
				<div class="error">{error}</div>
			{/if}

			{#each inputs as input (input.name)}
				<label for={input.name}>
					{input.label}
					{#if input.type === 'file'}
						<FileInput {values} {input} />
					{:else}
						<input
							type={input.type}
							name={input.name}
							required={input.required ?? true}
							minlength={input.minlength}
							value={values[input.name] ?? ''}
						/>
					{/if}
				</label>
			{/each}

			<input class="submit" type="submit" value="Submit" />
		</Card>
	</form>
</StandaloneCenter>

<style>
	form {
		min-width: 450px;
		display: inline;
	}

	@media (width <= 500px) {
		form {
			min-width: auto;
		}
	}

	label {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	input {
		color: var(--text-dark);
		border-radius: 0.5em;
		padding: 0.3em 0.5em;
	}

	.submit {
		border: 1px solid var(--text-light);
		background: none;
		color: var(--text-light);
		box-shadow: var(--box-shadow);
		border-radius: 5px;
		padding: 0.3em 0.6em;
		margin-top: 1em;
		cursor: pointer;

		transition: 100ms ease-in-out scale;
	}

	.submit:active {
		scale: 0.97;
	}
</style>

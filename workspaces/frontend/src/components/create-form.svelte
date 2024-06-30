<script lang="ts">
	import {getState} from '../state.ts';

	import Card from './card.svelte';
	import StandaloneCenter from './standalone-center.svelte';

	export let title: string;

	export let inputs: Array<{
		name: string;
		label: string;
		type: string;
		minlength: number;
		required?: boolean;
	}>;

	const {
		error,
		values,
	}: {
		error?: string;
		values: Record<string, string>;
	} = getState() ?? {values: {}};
</script>

<StandaloneCenter>
	<form method="POST">
		<Card>
			<h1>{title}</h1>
			{#if error}
				<div class="error">{error}</div>
			{/if}

			{#each inputs as input (input.name)}
				<label>
					{input.label}
					<input
						type={input.type}
						name={input.name}
						required={input.required ?? true}
						minlength={input.minlength}
						value={values[input.name] ?? ''}
					/>
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
		font-size: inherit;
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

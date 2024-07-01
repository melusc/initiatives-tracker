<script lang="ts">
	import type {
		ApiResponse,
		ApiResponseSuccess,
		EnrichedInitiative,
		Person,
	} from '@lusc/initiatives-tracker-util/types.js';

	import {createSuccessState} from '../../success-state.ts';

	import {browser} from '$app/environment';

	export let initiative: EnrichedInitiative;
	let people: Person[] | undefined | false;

	let personId: string | undefined;

	$: filteredPeople
		= people
		&& people.filter(
			person =>
				!initiative.signatures.some(signature => signature.id === person.id),
		);

	const successState = createSuccessState();

	async function submitSignature(event?: SubmitEvent): Promise<void> {
		event?.preventDefault();

		if (formDisabled) {
			return;
		}

		try {
			const response = await fetch(
				`/api/initiative/${initiative.id}/sign/${personId}`,
				{method: 'put'},
			);
			const body = (await response.json()) as ApiResponse<void>;

			if (body.type === 'success') {
				successState.setSuccess();
				initiative.signatures = [
					...initiative.signatures,
					(people as Person[]).find(s => s.id === personId)!,
				];

				personId = 'add-signature';
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				successState.setError(error.message);
			} else {
				successState.setError('Unknown error occurred');
			}
		}
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter') {
			void submitSignature();
		}
	}

	async function fetchPeople(): Promise<void> {
		try {
			const response = await fetch('/api/people', {redirect: 'error'});
			if (!response.ok) {
				people = false;
				return;
			}

			const body = (await response.json()) as ApiResponseSuccess<Person[]>;

			people = body.data;
		} catch {
			people = false;
		}
	}

	if (browser) {
		// eslint-disable-next-line unicorn/prefer-top-level-await
		void fetchPeople();
	}

	$: formDisabled = !personId || personId === 'add-signature';
</script>

<form class="add-signature" on:submit={submitSignature}>
	{#if filteredPeople && filteredPeople.length > 0}
		<select bind:value={personId} on:keydown={handleKeydown}>
			<option disabled selected value="add-signature">Add signature</option>

			{#each filteredPeople as person (person.id)}
				<option value={person.id}>{person.name}</option>
			{/each}
		</select>

		<input
			class:success={$successState?.type === 'success'}
			class:error={$successState?.type === 'error'}
			value="Submit"
			type="submit"
			disabled={formDisabled}
		/>
	{/if}

	{#if people === false}
		<div>Could not load list of people</div>
	{/if}
</form>

<style>
	.add-signature {
		margin-top: 1em;
		display: flex;
		flex-direction: column;
		gap: 5px;
		width: 400px;
		max-width: calc(100vw - 6em);
	}

	input,
	select,
	option {
		padding: 0.3em 0.6em;
		text-align: start;
		background: none;
		border: 1px solid var(--theme-primary);
		border-radius: 5px;
		font: inherit;
	}

	input:not([disabled]) {
		cursor: pointer;
	}
</style>

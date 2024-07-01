<script lang="ts">
	import type {
		ApiResponse,
		ApiResponseSuccess,
		EnrichedInitiative,
		Organisation,
	} from '@lusc/initiatives-tracker-util/types.js';

	import {createSuccessState} from '../../success-state.ts';

	import {browser} from '$app/environment';

	export let initiative: EnrichedInitiative;
	let organisations: Organisation[] | undefined | false;

	let organisationId: string | undefined;

	$: filteredOrganisations
		= organisations
		&& organisations.filter(
			organisation =>
				!initiative.organisations.some(
					associatedOrganisation =>
						associatedOrganisation.id === organisation.id,
				),
		);

	const successState = createSuccessState();

	async function submitAssociation(event?: SubmitEvent): Promise<void> {
		event?.preventDefault();

		if (formDisabled) {
			return;
		}

		try {
			const response = await fetch(
				`/api/initiative/${initiative.id}/organisation/${organisationId}`,
				{method: 'put'},
			);
			const body = (await response.json()) as ApiResponse<void>;

			if (body.type === 'success') {
				successState.setSuccess();
				initiative.organisations = [
					...initiative.organisations,
					(organisations as Organisation[]).find(s => s.id === organisationId)!,
				];

				organisationId = 'add-organisation';
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
			void submitAssociation();
		}
	}

	async function fetchOrganisations(): Promise<void> {
		try {
			const response = await fetch('/api/organisations', {redirect: 'error'});
			if (!response.ok) {
				organisations = false;
				return;
			}

			const body = (await response.json()) as ApiResponseSuccess<
				Organisation[]
			>;

			organisations = body.data;
		} catch {
			organisations = false;
		}
	}

	if (browser) {
		// eslint-disable-next-line unicorn/prefer-top-level-await
		void fetchOrganisations();
	}

	$: formDisabled = !organisationId || organisationId === 'add-organisation';
</script>

<form class="add-organisation" on:submit={submitAssociation}>
	{#if filteredOrganisations && filteredOrganisations.length > 0}
		<select bind:value={organisationId} on:keydown={handleKeydown}>
			<option disabled selected value="add-organisation"
				>Add organisation</option
			>

			{#each filteredOrganisations as organisation (organisation.id)}
				<option value={organisation.id}>{organisation.name}</option>
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

	{#if organisations === false}
		<div>Could not load list of organisations</div>
	{/if}
</form>

<style>
	.add-organisation {
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

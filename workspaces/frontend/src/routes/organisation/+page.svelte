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

<script lang="ts">
	import type {EnrichedOrganisation} from '@lusc/initiatives-tracker-util/types.js';

	import {getState} from '../../state.ts';
	import Organisation from '../../components/organisation.svelte';
	import Loading from '../../components/loading.svelte';
	import Initiative from '../../components/initiative.svelte';

	let organisation = $state(getState<EnrichedOrganisation>());
</script>

<div class="organisation">
	{#if organisation}
		<h1 class="name">{organisation.name}</h1>
		<Organisation bind:organisation allowEdit standalone />

		{#if organisation.signatures.length > 0}
			<h1 class="initiatives-title">Initiatives</h1>
			<div class="initiatives">
				{#each organisation.signatures as initiative (initiative.id)}
					<Initiative {initiative} allowEdit={false} standalone={false} />
				{/each}
			</div>
		{/if}
	{:else}
		<Loading />
	{/if}
</div>

<style>
	.organisation {
		width: 100%;
	}

	.initiatives {
		display: flex;
		flex-wrap: wrap;
		gap: 2em;
	}

	.name {
		margin-top: 0;
	}
</style>

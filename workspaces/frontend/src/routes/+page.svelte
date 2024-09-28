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
	import type {EnrichedInitiative} from '@lusc/initiatives-tracker-util/types.js';

	import Initiative from '../components/initiative.svelte';
	import {getState} from '../state.ts';
	import Loading from '../components/loading.svelte';
	import CreateButton from '../components/create-button.svelte';

	const initiatives = getState<EnrichedInitiative[]>();
</script>

<svelte:head>
	<title>Initiatives Tracker</title>
</svelte:head>

<CreateButton text="Add initiative" href="/initiative/create" />

<div class="index">
	{#if initiatives}
		{#each initiatives as initiative (initiative.id)}
			<Initiative {initiative} allowEdit={false} standalone={false} />
		{/each}
	{:else}
		<Loading />
	{/if}
</div>

<style>
	.index {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 2em;
	}
</style>

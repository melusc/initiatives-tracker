<script lang="ts">
	import {colorHash} from '@lusc/initiatives-tracker-util/color-hash.js';

	export let name: string;
	export let iconKey: string;
</script>

<div class="user-icon" title={name}>
	<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128">
		<circle cx="64" cy="64" r="64" fill="currentColor" />
		<circle cx="64" cy="64" r="60" fill={colorHash(iconKey)} />
		<text
			x="50%"
			y="50%"
			fill="currentColor"
			dominant-baseline="central"
			text-anchor="middle">{name.toUpperCase()[0]}</text
		>
	</svg>
</div>

<style>
	.user-icon {
		height: 3em;
		width: 3em;

		display: grid;
		place-items: center;
		user-select: none;

		color: var(--text-light);
	}

	text {
		font-size: 70px;
		font-family: 'Open Sans', sans-serif;
	}
</style>

<script lang="ts">
	import {colorHash} from '@lusc/initiatives-tracker-util/color-hash.js';

	export let userId: string;
</script>

<div class="user-icon">
	<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128">
		<style>
			text {
				font-size: 70px;
				font-family: 'Open Sans', sans-serif;
			}
		</style>
		<circle cx="64" cy="64" r="64" fill="currentColor" />
		<circle cx="64" cy="64" r="60" fill={colorHash(userId)} />
		<text
			x="50%"
			y="50%"
			fill="currentColor"
			dominant-baseline="middle"
			text-anchor="middle">{userId.toUpperCase()[0]}</text
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
</style>

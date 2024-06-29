<div class="card">
	<slot />
</div>

<style>
	.card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1em;
		box-shadow: var(--box-shadow);
		border-radius: 1em;
		padding: 2em;
		background: var(--theme-primary);
		color: var(--text-light);
		font-size: 1.3em;
		width: 400px;
		max-width: calc(100vw - 6em);
	}
</style>

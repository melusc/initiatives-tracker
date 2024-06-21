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
		padding: 2em 3em;
		background: var(--theme-primary);
		color: var(--text-light);
		font-size: 1.3em;
		width: 100%;
	}
</style>

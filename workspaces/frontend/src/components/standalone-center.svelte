<div class="place-center">
	<div class="card-width">
		<slot />
	</div>
</div>

<style>
	.place-center {
		padding: 3em;
		width: 100%;
		display: grid;
		place-items: center;
	}

	.card-width {
		max-width: 550px;
	}
</style>

<script lang="ts">
	import {getState} from '../../state.ts';

	const {
		error,
		values,
	}: {
		error: string;
		values: Record<string, string>;
	} = getState() ?? {values: {}};
</script>

<form method="POST">
	{#if error}
		<div class="error">{error}</div>
	{/if}

	<label>
		Short name
		<input
			type="text"
			name="shortName"
			required
			minlength="4"
			value={values['shortName'] ?? ''}
		/>
	</label>

	<label>
		Full name
		<input
			type="text"
			name="fullName"
			required
			minlength="4"
			value={values['fullName'] ?? ''}
		/>
	</label>

	<label>
		Website
		<input
			type="url"
			name="website"
			required
			minlength="10"
			value={values['website'] ?? ''}
		/>
	</label>

	<label>
		PDF URL
		<input
			type="url"
			name="pdfUrl"
			required
			minlength="10"
			value={values['pdfUrl'] ?? ''}
		/>
	</label>

	<label>
		Image URL
		<input
			type="url"
			name="imageUrl"
			required
			minlength="10"
			value={values['imageUrl'] ?? ''}
		/>
	</label>

	<input type="submit" value="Submit" />
</form>

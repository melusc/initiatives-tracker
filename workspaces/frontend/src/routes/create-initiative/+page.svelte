<script lang="ts">
	import CreateForm from '../../components/create-form.svelte';
</script>

<CreateForm
	title="Create initiative"
	inputs={[
		{
			name: 'shortName',
			label: 'Short name',
			type: 'text',
			minlength: 4,
		},
		{
			name: 'fullName',
			label: 'Full name',
			type: 'text',
			minlength: 4,
		},

		{
			name: 'website',
			label: 'Website',
			type: 'url',
			minlength: 10,
		},

		{
			name: 'pdfUrl',
			label: 'PDF URL',
			type: 'url',
			minlength: 10,
		},
		{
			name: 'imageUrl',
			label: 'Image URL',
			type: 'url',
			minlength: 10,
		},
	]}
/>

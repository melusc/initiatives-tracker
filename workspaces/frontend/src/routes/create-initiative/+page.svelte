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
			name: 'deadline',
			label: 'Deadline',
			type: 'date',
			minlength: 0,
		},
		{
			name: 'website',
			label: 'Website',
			type: 'url',
			minlength: 10,
		},

		{
			name: 'pdf',
			label: 'PDF URL',
			type: 'url',
			minlength: 10,
		},
		{
			name: 'image',
			label: 'Image URL',
			type: 'url',
			minlength: 10,
		},
	]}
/>

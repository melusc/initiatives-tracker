<script lang="ts">
	import CreateForm from '../../components/create-form.svelte';
</script>

<CreateForm
	title="Create organisation"
	inputs={[
		{
			name: 'name',
			label: 'Name',
			type: 'text',
			minlength: 4,
		},
		{
			name: 'image',
			label: 'Image URL',
			type: 'url',
			minlength: 0,
			required: false,
		},
		{
			name: 'website',
			label: 'Website',
			type: 'url',
			minlength: 0,
			required: false,
		},
	]}
/>

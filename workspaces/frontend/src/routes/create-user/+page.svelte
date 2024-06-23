<script lang="ts">
	import CreateForm from '../../components/create-form.svelte';
</script>

<CreateForm
	title="Create new person"
	inputs={[
		{
			name: 'name',
			label: 'Name',
			type: 'text',
			minlength: 4,
		},
	]}
/>

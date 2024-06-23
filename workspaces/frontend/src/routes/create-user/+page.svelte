<script lang="ts">
	import CreateForm from '../../components/create-form.svelte';
</script>

<CreateForm
	inputs={[
		{
			name: 'name',
			label: 'Name',
			type: 'text',
			minlength: 4,
		},
	]}
/>

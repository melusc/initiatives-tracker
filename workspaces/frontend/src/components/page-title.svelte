<script lang="ts">
	const {title}: {title?: string | undefined} = $props();
</script>

<svelte:head>
	{#if title}
		<title>{title} | Initiatives Tracker</title>
	{:else}
		<title>Initiatives Tracker</title>
	{/if}
</svelte:head>

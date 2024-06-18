<script lang="ts">
	import type {Initiative} from '@lusc/initiatives-tracker-util/types.js';

	export let initiative: Initiative;
</script>

<div class="initiative" data-initiative-id={initiative.id}>
	<a href={`/initiative/${initiative.id}`}>
		<div>{initiative.shortName}</div>
		<img src={initiative.imageUrl} alt="" />
	</a>
</div>

<script lang="ts">
	import type {EnrichedPerson} from '@lusc/initiatives-tracker-util/types.js';

	import {getState} from '../../state.ts';

	const people = getState<EnrichedPerson[]>();
</script>

<a href="/person/create">Create person</a>
<pre>
	{JSON.stringify(people)}
</pre>

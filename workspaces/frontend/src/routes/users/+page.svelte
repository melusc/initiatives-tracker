<script lang="ts">
	import type {EnrichedUser} from '@lusc/initiatives-tracker-util/types.js';

	import {getState} from '../../state.ts';

	const users = getState<EnrichedUser[]>();
</script>

<a href="/user/create">Create user</a>
<pre>
	{JSON.stringify(users)}
</pre>

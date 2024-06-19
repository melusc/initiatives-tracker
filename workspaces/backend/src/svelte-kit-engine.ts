import {readFile} from 'node:fs/promises';

import type {Locals} from 'express';

export async function svelteKitEngine(
	path: string,
	options_: unknown,
	callback: (error: any, rendered?: string) => void,
): Promise<void> {
	const options = options_ as Record<string, unknown>;

	if (!('user' in options)) {
		callback(new Error('.user not passed to options'));
		return;
	}

	const user = options['user'] as Locals['user'] | undefined;
	const state = options['state'];

	try {
		const content = await readFile(path, 'utf8');
		const injected = content
			.replace('__state__', JSON.stringify(state))
			.replace('__user__', JSON.stringify(user));
		callback(null, injected);
	} catch (error: unknown) {
		callback(error, undefined);
	}
}

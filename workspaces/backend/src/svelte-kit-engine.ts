import {readFile} from 'node:fs/promises';

import type {Locals} from 'express';

export async function svelteKitEngine(
	path: string,
	options_: unknown,
	callback: (error: any, rendered?: string) => void,
): Promise<void> {
	const options = options_ as Record<string, unknown>;

	if (!('login' in options)) {
		callback(new Error('.login not passed to options'));
		return;
	}

	if (!('state' in options)) {
		callback(new Error('.state not passed to options'));
		return;
	}

	const login = options['login'] as Locals['login'] | undefined;
	const state = options['state'];

	try {
		const content = await readFile(path, 'utf8');
		const injected = content
			.replace('__state__', JSON.stringify(state))
			.replace('__login__', JSON.stringify(login));
		callback(null, injected);
	} catch (error: unknown) {
		callback(error, undefined);
	}
}

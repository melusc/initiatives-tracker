import {readFile} from 'node:fs/promises';

export async function svelteKitEngine(
	path: string,
	options: unknown,
	callback: (error: any, rendered?: string) => void,
): Promise<void> {
	try {
		const content = await readFile(path, 'utf8');
		const injected = content.replace(
			'"##state##"',
			JSON.stringify((options as Record<string, unknown>)['state'] ?? {}),
		);
		callback(null, injected);
	} catch (error: unknown) {
		callback(error, undefined);
	}
}

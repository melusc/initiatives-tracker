declare const state: unknown;

export function getState<T>(): T | undefined {
	return typeof state !== 'undefined' ? (state as T) : undefined;
}

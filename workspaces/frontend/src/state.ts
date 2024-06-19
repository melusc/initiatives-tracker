import {LoginInfo} from '@lusc/initiatives-tracker-util/types.js';

declare const state: unknown;

export function getState<T>(): T | undefined {
	return typeof state !== 'undefined' ? (state as T) : undefined;
}

declare const user: LoginInfo | undefined;

export function getUser(): LoginInfo | undefined {
	return typeof user !== 'undefined' ? user : undefined;
}

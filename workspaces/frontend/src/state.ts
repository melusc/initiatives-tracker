/* eslint-disable unicorn/no-typeof-undefined */

import {type LoginInfo} from '@lusc/initiatives-tracker-util/types.js';

declare const state: unknown;

export function getState<T>(): T | undefined {
	return typeof state === 'undefined' ? undefined : (state as T);
}

declare const user: LoginInfo | undefined;

export function getUser(): LoginInfo | undefined {
	return typeof user === 'undefined' ? undefined : user;
}

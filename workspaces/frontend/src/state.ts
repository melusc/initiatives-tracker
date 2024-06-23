/* eslint-disable unicorn/no-typeof-undefined */

import {type LoginInfo} from '@lusc/initiatives-tracker-util/types.js';

declare const state: unknown;

export function getState<T>(): T | undefined {
	return typeof state === 'undefined' ? undefined : (state as T);
}

declare const login: LoginInfo | undefined;

export function getLogin(): LoginInfo | undefined {
	return typeof login === 'undefined' ? undefined : login;
}

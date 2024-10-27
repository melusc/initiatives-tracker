/*!
Copyright (C) 2024  Luca Schnellmann

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import type {Initiative, Organisation, Person} from './types.js';

type KeysMatching<T, V> = {
	[K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

function makeSorter<R extends Record<string, unknown>>(
	keys: Array<{key: KeysMatching<R, string | null>; reverse: boolean}>,
) {
	return (array: R[]) =>
		array.toSorted((a, b) => {
			for (const {key, reverse} of keys) {
				if (a[key] === null || b[key] === null) {
					return a[key] === null ? (b[key] === null ? 0 : 1) : -1;
				}

				const result = (a[key] as string).localeCompare(
					b[key] as string,
					undefined,
					{
						numeric: true,
						caseFirst: 'lower',
						sensitivity: 'base',
					},
				);

				if (result !== 0) {
					return reverse ? -result : result;
				}
			}

			return 0;
		});
}

export const sortInitiatives = makeSorter<Initiative>([
	{key: 'deadline', reverse: true},
	{key: 'shortName', reverse: false},
	{key: 'id', reverse: false},
]);
export const sortPeople = makeSorter<Person>([
	{key: 'name', reverse: false},
	{key: 'id', reverse: false},
]);
export const sortOrganisations = makeSorter<Organisation>([
	{key: 'name', reverse: false},
	{key: 'id', reverse: false},
]);

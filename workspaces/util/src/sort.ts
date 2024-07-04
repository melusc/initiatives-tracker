import type {Initiative, Organisation, Person} from './types.js';

type KeysMatching<T, V> = {
	[K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

function makeSorter<R extends Record<string, unknown>>(
	keys: Array<{key: KeysMatching<R, string>; reverse: boolean}>,
) {
	return (array: R[]) =>
		array.toSorted((a, b) => {
			for (const {key, reverse} of keys) {
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

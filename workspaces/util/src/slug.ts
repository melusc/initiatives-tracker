import {randomBytes} from 'crypto';

const accentsNormalise = {
	ü: 'u',
	ä: 'a',
	ö: 'o',
	é: 'e',
	è: 'e',
	ë: 'e',
	ï: 'i',
} as const;

const accentsRegex = new RegExp(
	'[' + Object.keys(accentsNormalise).join('') + ']',
	'g',
);

export function makeSlug(s: string) {
	s = s.trim().toLowerCase();

	s = s.replaceAll(
		accentsRegex,
		k => accentsNormalise[k as keyof typeof accentsNormalise],
	);

	s = s.replaceAll(/\s+/g, '-');

	s += '-' + randomBytes(4).toString('hex');

	return s;
}

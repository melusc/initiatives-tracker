import {randomBytes} from 'node:crypto';

export function makeSlug(s: string) {
	// Turn 'ß' into 'ss' and maybe more ?
	s = s.trim().toUpperCase().toLowerCase();

	s = s.normalize('NFKD').replaceAll(/\p{Diacritic}/gu, '');

	s += '-' + randomBytes(4).toString('hex');

	// Merge many "-", "_", and spaces into single "-"
	s = s.replaceAll(/[\s_\-/]+/g, '-');

	s = s.replaceAll(/[^\da-z-]/g, '');

	return s;
}

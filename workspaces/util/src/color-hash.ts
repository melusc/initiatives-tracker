const colors = [
	'#1e71ad',
	'#f6773c',
	'#6dcebd',
	'#786ca4',
	'#f9c641',
	'#654a70',
	'#2e497f',
	'#c6477a',
	'#1a5790',
	'#ea8cb7',
	'#46a5d6',
	'#c6403d',
	'#334763',
	'#19a84c',
	'#4a006c',
	'#efa932',
	'#5b9e42',
	'#9b1fe8',
	'#e05d41',
	'#2d8c54',
	'#ba9ac1',
	'#b63265',
	'#224e9b',
	'#df814c',
	'#f3ab3f',
	'#cb61a8',
] as const;

export function colorHash(s: string): string {
	let hash = 0;

	s = s.trim().toUpperCase();

	for (const c of s) {
		hash += c.codePointAt(0)!;
	}

	return colors[hash % colors.length]!;
}

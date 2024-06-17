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

export function colorHashSvg(s: string) {
	s = s.trim().toUpperCase();

	const color = colorHash(s);

	return `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="none" viewBox="0 0 128 128">
	<style><![CDATA[
		@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap');

		text {
			font-size: 70px;
			font-family: 'Open Sans', sans-serif;
		}
	]]></style>
  <circle cx="64" cy="64" r="64" fill="${color}"/>
  <text x="50%" y="50%" fill="#fff" dominant-baseline="middle" text-anchor="middle">&#${s[0]!.codePointAt(0)};</text>
</svg>
`;
}

import {randomUUID} from 'node:crypto';
import {mkdir, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

import {fileTypeFromBuffer} from 'file-type';

export const dataDirectory = new URL('../data/', import.meta.url);
await mkdir(dataDirectory, {recursive: true});

export const pdfOutDirectory = new URL('pdf/', dataDirectory);
await mkdir(pdfOutDirectory, {recursive: true});

export const imageOutDirectory = new URL('image/', dataDirectory);
await mkdir(imageOutDirectory, {recursive: true});

export const staticRoot = fileURLToPath(
	import.meta.resolve('@lusc/initiatives-tracker-frontend'),
);

export function transformImageUrl(imageUrl: string) {
	return `/api/user-content/image/${imageUrl}`;
}

export function transformPdfUrl(pdfUrl: string) {
	return `/api/user-content/pdf/${pdfUrl}`;
}

const allowedImages: ReadonlySet<string> = new Set<string>([
	'image/jpeg',
	'image/png',
	'image/avif',
	'image/webp',
]);

export async function fetchImage(imageUrl: string) {
	const response = await fetch(imageUrl);
	const body = await response.arrayBuffer();

	const type = await fileTypeFromBuffer(body);

	if (!type || !allowedImages.has(type.mime)) {
		throw new Error('Not an image.');
	}

	const id = randomUUID() + '.' + type.ext;

	await writeFile(new URL(id, imageOutDirectory), new DataView(body));

	return id;
}

export async function fetchPdf(pdfUrl: string) {
	const response = await fetch(pdfUrl);
	const body = await response.arrayBuffer();

	const type = await fileTypeFromBuffer(body);

	if (type?.mime !== 'application/pdf') {
		throw new Error('Not a pdf.');
	}

	const id = randomUUID() + '.pdf';

	await writeFile(new URL(id, pdfOutDirectory), new DataView(body));

	return id;
}

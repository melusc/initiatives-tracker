import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';

import {fileTypeFromBuffer} from 'file-type';
import type {
	Initiative,
	Organisation,
} from '@lusc/initiatives-tracker-util/types.js';

import {validateUrl} from './validate-body.ts';

export const dataDirectory = new URL('../data/', import.meta.url);
await mkdir(dataDirectory, {recursive: true});

export const pdfOutDirectory = new URL('pdf/', dataDirectory);
await mkdir(pdfOutDirectory, {recursive: true});

export const imageOutDirectory = new URL('image/', dataDirectory);
await mkdir(imageOutDirectory, {recursive: true});

export const staticRoot = fileURLToPath(
	import.meta.resolve('@lusc/initiatives-tracker-frontend'),
);

export function transformOrganisationUrls<T extends Organisation>(
	organisation: T,
): T {
	return {
		...organisation,
		image:
			organisation.image === null
				? null
				: transformImageUrl(organisation.image),
	};
}

export function transformInitiativeUrls<T extends Initiative>(
	initiative: T,
): T {
	return {
		...initiative,
		pdfUrl: transformPdfUrl(initiative.pdfUrl),
		imageUrl: transformImageUrl(initiative.imageUrl),
	};
}

export function transformImageUrl(imageUrl: string) {
	return `/api/user-content/image/${imageUrl}`;
}

export function transformPdfUrl(pdfUrl: string) {
	return `/api/user-content/pdf/${pdfUrl}`;
}

/**
 * Timeout after five seconds. Disallow files greater than 10 mb
 */
async function safeFetch(url: string) {
	const controller = new AbortController();
	const {signal} = controller;
	setTimeout(() => {
		controller.abort();
	}, 5e3);
	const response = await fetch(url, {signal});

	const urlValidity = await validateUrl('', response.url);
	if (urlValidity.type === 'error') {
		throw new Error('Internal url');
	}

	const body = await response.arrayBuffer();

	// 10 mb
	if (body.byteLength > 10_485_760) {
		throw new Error('File is too large');
	}

	return body;
}

const allowedImages: ReadonlySet<string> = new Set<string>([
	'image/jpeg',
	'image/png',
	'image/avif',
	'image/webp',
	'application/xml',
]);

export async function fetchImage(
	imageUrl: string,
): Promise<{id: string; suggestedFilePath: URL; body: ArrayBuffer}> {
	const body = await safeFetch(imageUrl);

	const type = await fileTypeFromBuffer(body);

	if (type && type.mime === 'application/xml') {
		const stringified = new TextDecoder().decode(body);

		if (!stringified.includes('<svg')) {
			throw new Error('Not an image.');
		}
	}

	if (!type || !allowedImages.has(type.mime)) {
		throw new Error('Not an image.');
	}

	const id = [
		randomUUID(),
		type.mime === 'application/xml' ? 'svg' : type.ext,
	].join('.');

	return {
		id,
		suggestedFilePath: new URL(id, imageOutDirectory),
		body,
	};
}

export async function fetchPdf(
	pdfUrl: string,
): Promise<{id: string; suggestedFilePath: URL; body: ArrayBuffer}> {
	const body = await safeFetch(pdfUrl);

	const type = await fileTypeFromBuffer(body);

	if (type?.mime !== 'application/pdf') {
		throw new Error('Not a pdf.');
	}

	const id = randomUUID() + '.pdf';

	return {
		id,
		suggestedFilePath: new URL(id, pdfOutDirectory),
		body,
	};
}

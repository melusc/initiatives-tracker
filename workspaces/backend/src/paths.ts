import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';

import {fileTypeFromBuffer} from 'file-type';
import type {
	Initiative,
	Organisation,
} from '@lusc/initiatives-tracker-util/types.js';
import {optimize as svgoOptimise} from 'svgo';

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
		imageUrl:
			organisation.imageUrl === null
				? null
				: transformImageUrl(organisation.imageUrl),
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
]);

function handleSvg(body: string): {
	id: string;
	suggestedFilePath: URL;
	body: ArrayBuffer;
} {
	try {
		const optimised = svgoOptimise(body, {
			multipass: true,
			plugins: [
				'preset-default',
				{
					name: 'set-dimensions',
					fn() {
						return {
							element: {
								enter(node) {
									if (node.name === 'svg') {
										const viewBox = node.attributes['viewBox'];

										if (
											viewBox
											&& !('width' in node.attributes)
											&& !('height' in node.attributes)
										) {
											const [width, height] = viewBox.split(/\s+/).slice(2);
											console.log(width, height);
											if (width && height) {
												const w = 1000;
												const h
													= (Number.parseInt(height, 10)
														/ Number.parseInt(width, 10))
													* 1000;
												node.attributes['width'] = String(w);
												node.attributes['height'] = String(h);
											}
										}
									}
								},
							},
						};
					},
				},
			],
		});

		const id = [randomUUID(), 'svg'].join('.');

		return {
			id,
			suggestedFilePath: new URL(id, imageOutDirectory),
			body: new TextEncoder().encode(optimised.data).buffer,
		};
	} catch {
		throw new Error('Not an image.');
	}
}

export async function fetchImage(
	imageUrl: string,
): Promise<{id: string; suggestedFilePath: URL; body: ArrayBuffer}> {
	const body = await safeFetch(imageUrl);

	const stringified = new TextDecoder().decode(body);

	const type = await fileTypeFromBuffer(body);

	if (type?.mime === 'application/xml' || stringified.includes('<svg')) {
		return handleSvg(stringified);
	}

	if (!type || !allowedImages.has(type.mime)) {
		throw new Error('Not an image.');
	}

	const id = [randomUUID(), type.ext].join('.');

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

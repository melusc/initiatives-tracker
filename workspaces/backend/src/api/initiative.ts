import {unlink} from 'node:fs/promises';
import {makeSlug} from '@lusc/initiatives-tracker-util/slug.js';
import {typeOf} from '@lusc/initiatives-tracker-util/type-of.js';
import type {RequestHandler} from 'express';
import {database} from '../db.ts';
import {
	fetchImage,
	fetchPdf,
	imageOutDirectory,
	pdfOutDirectory,
	transformImageUrl,
	transformPdfUrl,
} from '../paths.ts';
import {isValidUrl, makeValidator} from '../validate-body.ts';
import type {ApiResponse} from './response.d.ts';
import type {User} from './users.ts';

type Initiative = {
	id: string;
	shortName: string;
	fullName: string;
	website: string;
	pdfUrl: string;
	imageUrl: string;
};

type InitiativeSignatures = Initiative & {
	signatures: User[];
};

function transformInitiativeUrls(initiative: Initiative): Initiative {
	return {
		...initiative,
		pdfUrl: transformPdfUrl(initiative.pdfUrl),
		imageUrl: transformImageUrl(initiative.imageUrl),
	};
}

const initativeKeyValidators = {
	shortName(shortName: unknown): ApiResponse<string> {
		if (typeof shortName !== 'string') {
			return {
				type: 'error',
				readableError: `Invalid type for shortName. Expected string, got ${typeOf(shortName)}`,
				error: 'invalid-type',
			};
		}

		if (shortName.length < 10) {
			return {
				type: 'error',
				readableError:
					'Short Name is too short. Must be at least 10 characters.',
				error: 'short-name-too-short',
			};
		}

		return {
			type: 'success',
			data: shortName,
		};
	},
	fullName(fullName: unknown): ApiResponse<string> {
		if (typeof fullName !== 'string') {
			return {
				type: 'error',
				readableError: `Invalid type for fullName. Expected string, got ${typeOf(fullName)}`,
				error: 'invalid-type',
			};
		}

		if (fullName.length < 10) {
			return {
				type: 'error',
				readableError:
					'Full Name is too short. Must be at least 10 characters.',
				error: 'full-name-too-short',
			};
		}

		return {
			type: 'success',
			data: fullName,
		};
	},
	website(website: unknown): ApiResponse<string> {
		if (typeof website !== 'string') {
			return {
				type: 'error',
				readableError: `Invalid type for website. Expected string, got ${typeOf(website)}`,
				error: 'invalid-type',
			};
		}

		if (!isValidUrl(website)) {
			return {
				type: 'error',
				readableError: 'Website is not valid URL.',
				error: 'invalid-url',
			};
		}

		const websiteUrl = new URL(website);
		websiteUrl.hash = '';
		websiteUrl.username = '';
		websiteUrl.password = '';

		return {
			type: 'success',
			data: websiteUrl.href,
		};
	},
	async pdfUrl(pdfUrl: unknown): Promise<ApiResponse<string>> {
		if (typeof pdfUrl !== 'string') {
			return {
				type: 'error',
				readableError: `Invalid type for imageUrl. Expected string, got ${typeOf(pdfUrl)}`,
				error: 'invalid-type',
			};
		}

		if (!isValidUrl(pdfUrl)) {
			return {
				type: 'error',
				readableError: 'PDF URL is not valid URL.',
				error: 'invalid-url',
			};
		}

		try {
			const localPdf = await fetchPdf(pdfUrl);
			return {
				type: 'success',
				data: localPdf,
			};
		} catch {
			return {
				type: 'error',
				readableError: 'Could not fetch PDF. Either invalid URL or not a PDF.',
				error: 'fetch-error',
			};
		}
	},
	async imageUrl(imageUrl: unknown): Promise<ApiResponse<string>> {
		if (typeof imageUrl !== 'string') {
			return {
				type: 'error',
				readableError: `Invalid type for imageUrl. Expected string, got ${typeOf(imageUrl)}`,
				error: 'invalid-type',
			};
		}

		if (!isValidUrl(imageUrl)) {
			return {
				type: 'error',
				readableError: 'Image URL is not valid URL.',
				error: 'invalid-url',
			};
		}

		try {
			const localImage = await fetchImage(imageUrl);
			return {
				type: 'success',
				data: localImage,
			};
		} catch {
			return {
				type: 'error',
				readableError:
					'Could not fetch Image. Either invalid URL or not an image.',
				error: 'fetch-error',
			};
		}
	},
};

const initiativeValidator = makeValidator(initativeKeyValidators);

export const createInitiative: RequestHandler = async (request, response) => {
	const validateResult = await initiativeValidator(
		request.body as Record<string, unknown>,
		['shortName', 'fullName', 'website', 'pdfUrl', 'imageUrl'],
	);

	if (validateResult.type === 'error') {
		return response.status(400).json(validateResult);
	}

	const {website, fullName, shortName, pdfUrl, imageUrl} = validateResult.data;

	const id = makeSlug(shortName);

	const result: Initiative = {
		id,
		shortName,
		fullName,
		website,
		pdfUrl,
		imageUrl,
	};

	database
		.prepare<Initiative>(
			`INSERT INTO initiatives
			(id, shortName, fullName, website, pdfUrl, imageUrl) 
			VALUES (:id, :shortName, :fullName, :website, :pdfUrl, :imageUrl)`,
		)
		.run(result);

	return response.status(200).json({
		type: 'success',
		data: transformInitiativeUrls(result),
	});
};

export const getInitiative: RequestHandler<{id: string}> = (
	request,
	response,
) => {
	const initiative = database
		.prepare<
			{id: string},
			Initiative
		>('SELECT id, shortName, fullName, website, pdfUrl, imageUrl from initiatives where id = :id')
		.get({id: request.params.id});

	if (!initiative) {
		return response.status(404).json({
			type: 'error',
			readableError: 'Initiative does not exist.',
			error: 'not-found',
		});
	}

	return response.status(200).json({
		type: 'success',
		data: addSignatures(transformInitiativeUrls(initiative)),
	});
};

function addSignatures(initiative: Initiative): InitiativeSignatures {
	const users = database
		.prepare<
			{initiativeId: string},
			User
		>('SELECT users.* FROM users INNER JOIN signatures on signatures.userId = users.id WHERE signatures.initiativeId = :initiativeId')
		.all({initiativeId: initiative.id});

	return {
		...initiative,
		signatures: users,
	};
}

export const getAllInitiatives: RequestHandler = async (_request, response) => {
	const rows = database
		.prepare<[], Initiative>('SELECT initiatives.* from initiatives')
		.all();

	response.status(200).json({
		type: 'success',
		data: rows.map(initiative =>
			addSignatures(transformInitiativeUrls(initiative)),
		),
	});
};

export const patchInitiative: RequestHandler<{id: string}> = async (
	request,
	response,
) => {
	const {id} = request.params;

	const oldRow = database
		.prepare<
			{id: string},
			Initiative
		>('SELECT id, shortName, fullName, website, pdfUrl, imageUrl FROM initiatives WHERE id = :id')
		.get({id});

	if (!oldRow) {
		response.status(404).json({
			type: 'error',
			readableError: 'Initiative does not exist.',
			error: 'not-found',
		});
		return;
	}

	const body = request.body as Record<string, unknown>;
	const validateResult = await initiativeValidator(
		body,
		Object.keys(body) as Array<keyof typeof initativeKeyValidators>,
	);

	if (validateResult.type === 'error') {
		response.status(400).json(validateResult);
		return;
	}

	const newData = validateResult.data;

	if (Object.keys(newData).length === 0) {
		response.status(200).json({
			type: 'success',
			data: oldRow,
		});
		return;
	}

	const query = [];

	for (const key of Object.keys(newData)) {
		if (key === 'pdfUrl') {
			try {
				// eslint-disable-next-line no-await-in-loop
				await unlink(new URL(oldRow.pdfUrl, pdfOutDirectory));
			} catch {}
		} else if (key === 'imageUrl') {
			try {
				// eslint-disable-next-line no-await-in-loop
				await unlink(new URL(oldRow.imageUrl, imageOutDirectory));
			} catch {}
		}

		query.push(`${key} = :${key}`);
	}

	database
		.prepare(`UPDATE initiatives SET ${query.join(', ')} WHERE id = :id`)
		.run({
			...newData,
			id,
		});

	response.status(200).send({
		type: 'success',
		data: transformInitiativeUrls({
			...oldRow,
			...newData,
		}),
	});
};

export const deleteInitiative: RequestHandler<{id: string}> = async (
	request,
	response,
) => {
	const {id} = request.params;

	const oldRow = database
		.prepare<
			{id: string},
			Initiative
		>('SELECT id, shortName, fullName, website, pdfUrl, imageUrl FROM initiatives WHERE id = :id')
		.get({id});

	if (!oldRow) {
		response.status(404).json({
			type: 'error',
			readableError: 'Initiative does not exist.',
			error: 'not-found',
		});
		return;
	}

	try {
		await unlink(new URL(oldRow.pdfUrl, pdfOutDirectory));
	} catch {}

	try {
		await unlink(new URL(oldRow.imageUrl, imageOutDirectory));
	} catch {}

	database
		.prepare<{id: string}>('DELETE FROM initiatives WHERE id = :id')
		.run({id});

	response.status(200).json({
		type: 'success',
	});
};

export const initiativeAddSignature: RequestHandler<{
	initiativeId: string;
	userId: string;
}> = (request, response) => {
	database
		.prepare<{
			initiativeId: string;
			userId: string;
		}>(
			'INSERT INTO signatures (initiativeId, userId) values (:initiativeId, :userId);',
		)
		.run(request.params);

	response.status(201).json({
		type: 'success',
	});
};

export const initiativeRemoveSignature: RequestHandler<{
	initiativeId: string;
	userId: string;
}> = (request, response) => {
	const result = database
		.prepare<{
			initiativeId: string;
			userId: string;
		}>(
			'DELETE FROM signatures where initiativeId = :initiativeId AND userId = :userId;',
		)
		.run(request.params);

	if (result.changes === 0) {
		response.status(404).json({
			type: 'error',
			readableError: 'Signature does not exist.',
			error: 'not-found',
		});
		return;
	}

	response.status(200).json({
		type: 'success',
	});
};

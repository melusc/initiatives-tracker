import {unlink, writeFile} from 'node:fs/promises';

import {makeSlug} from '@lusc/initiatives-tracker-util/slug.js';
import {typeOf} from '@lusc/initiatives-tracker-util/type-of.js';
import type {RequestHandler} from 'express';
import type {
	Initiative,
	EnrichedInitiative,
	Organisation,
	Person,
	ApiResponse,
} from '@lusc/initiatives-tracker-util/types.js';

import {database} from '../db.ts';
import {
	fetchImage,
	fetchPdf,
	imageOutDirectory,
	pdfOutDirectory,
	transformInitiativeUrls,
	transformOrganisationUrls,
} from '../paths.ts';
import {makeValidator, validateUrl} from '../validate-body.ts';

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
	async website(website: unknown): Promise<ApiResponse<string>> {
		const isValidUrl = await validateUrl('website', website);
		if (isValidUrl.type === 'error') {
			return isValidUrl;
		}

		const websiteUrl = new URL(website as string);
		websiteUrl.hash = '';
		websiteUrl.username = '';
		websiteUrl.password = '';

		return {
			type: 'success',
			data: websiteUrl.href,
		};
	},
	deadline(input: unknown): ApiResponse<string> {
		if (typeof input !== 'string') {
			return {
				type: 'error',
				readableError: `Invalid type for deadline. Expected number, got ${typeOf(input)}`,
				error: 'invalid-type',
			};
		}

		const deadline = input.trim();

		const date = new Date(deadline);
		if (Number.isNaN(date.getTime())) {
			return {
				type: 'error',
				readableError: 'Invalid date.',
				error: 'invalid-date',
			};
		}

		const stringified = date.toISOString().slice(0, 'YYYY-MM-DD'.length);
		if (stringified !== deadline) {
			return {
				type: 'error',
				readableError: `Invalid date. Normalising input "${deadline}" resulted in "${stringified}". Expected it to stay unchanged`,
				error: 'invalid-date',
			};
		}

		return {
			type: 'success',
			data: deadline,
		};
	},
	async pdfUrl(
		pdfUrl: unknown,
	): Promise<
		ApiResponse<{id: string; suggestedFilePath: URL; body: ArrayBuffer}>
	> {
		const isValidUrl = await validateUrl('PDF URL', pdfUrl);
		if (isValidUrl.type === 'error') {
			return isValidUrl;
		}

		try {
			const localPdf = await fetchPdf(pdfUrl as string);
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
	async imageUrl(
		imageUrl: unknown,
	): Promise<
		ApiResponse<{id: string; suggestedFilePath: URL; body: ArrayBuffer}>
	> {
		const isValidUrl = await validateUrl('image URL', imageUrl);
		if (isValidUrl.type === 'error') {
			return isValidUrl;
		}

		try {
			const localImage = await fetchImage(imageUrl as string);
			return {
				type: 'success',
				data: localImage,
			};
		} catch {
			return {
				type: 'error',
				readableError:
					'Could not fetch image. Either it was an invalid URL or the file was not an image.',
				error: 'fetch-error',
			};
		}
	},
};

const initiativeValidator = makeValidator(initativeKeyValidators);

export async function createInitiative(
	loginUserId: string,
	body: Record<string, unknown>,
): Promise<ApiResponse<EnrichedInitiative>> {
	const validateResult = await initiativeValidator(body, [
		'shortName',
		'fullName',
		'website',
		'pdfUrl',
		'imageUrl',
		'deadline',
	]);

	if (validateResult.type === 'error') {
		return validateResult;
	}

	const {website, fullName, shortName, pdfUrl, imageUrl, deadline}
		= validateResult.data;

	await writeFile(pdfUrl.suggestedFilePath, new DataView(pdfUrl.body));
	await writeFile(imageUrl.suggestedFilePath, new DataView(imageUrl.body));

	const id = makeSlug(shortName);

	const result: Initiative = {
		id,
		shortName,
		fullName,
		website,
		pdfUrl: pdfUrl.id,
		imageUrl: imageUrl.id,
		deadline,
	};

	database
		.prepare<Initiative>(
			`INSERT INTO initiatives
			(id, shortName, fullName, website, pdfUrl, imageUrl, deadline) 
			VALUES (:id, :shortName, :fullName, :website, :pdfUrl, :imageUrl, :deadline)`,
		)
		.run(result);

	return {
		type: 'success',
		data: enrichInitiative(transformInitiativeUrls(result), loginUserId),
	};
}

export const createInitiativeEndpoint: RequestHandler = async (
	request,
	response,
) => {
	const result = await createInitiative(
		response.locals.login.id,
		request.body as Record<string, unknown>,
	);

	if (result.type === 'error') {
		return response.status(400).json(result);
	}

	return response.status(201).json(result);
};

export function getInitiative(
	id: string,
	loginUserId: string,
): Initiative | false {
	const initiative = database
		.prepare<
			{id: string},
			Initiative
		>('SELECT initiatives.* from initiatives where id = :id')
		.get({id});

	if (!initiative) {
		return false;
	}

	return enrichInitiative(transformInitiativeUrls(initiative), loginUserId);
}

export const getInitiativeEndpoint: RequestHandler<{id: string}> = (
	request,
	response,
) => {
	const initiative = getInitiative(request.params.id, response.locals.login.id);

	if (!initiative) {
		return response.status(404).json({
			type: 'error',
			readableError: 'Initiative does not exist.',
			error: 'not-found',
		});
	}

	return response.status(200).json({
		type: 'success',
		data: initiative,
	});
};

function enrichInitiative(
	initiative: Initiative,
	loginUserId: string,
): EnrichedInitiative {
	const people = database
		.prepare<{initiativeId: string; loginUserId: string}, Person>(
			`SELECT people.* FROM people
			INNER JOIN signatures on signatures.personId = people.id
			WHERE signatures.initiativeId = :initiativeId
			AND people.owner = :loginUserId`,
		)
		.all({initiativeId: initiative.id, loginUserId});

	const organisations = database
		.prepare<{initiativeId: string}, Organisation>(
			`SELECT organisations.* FROM organisations
				INNER JOIN initiativeOrganisations ON organisations.id = initiativeOrganisations.organisationId
				WHERE initiativeOrganisations.initiativeId = :initiativeId`,
		)
		.all({initiativeId: initiative.id});

	return {
		...initiative,
		signatures: people,
		organisations: organisations.map(organisation =>
			transformOrganisationUrls(organisation),
		),
	};
}

export function getAllInitiatives(loginUserId: string): EnrichedInitiative[] {
	const rows = database
		.prepare<[], Initiative>('SELECT initiatives.* from initiatives')
		.all();

	return rows.map(initiative =>
		enrichInitiative(transformInitiativeUrls(initiative), loginUserId),
	);
}

export const getAllInitiativesEndpoint: RequestHandler = async (
	_request,
	response,
) => {
	response.status(200).json({
		type: 'success',
		data: getAllInitiatives(response.locals.login.id),
	});
};

export const patchInitiativeEndpoint: RequestHandler<{id: string}> = async (
	request,
	response,
) => {
	const {id} = request.params;

	const oldRow = database
		.prepare<
			{id: string},
			Initiative
		>('SELECT initiatives.* FROM initiatives WHERE id = :id')
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

	if (newData.pdfUrl) {
		await writeFile(
			newData.pdfUrl.suggestedFilePath,
			new DataView(newData.pdfUrl.body),
		);
	}

	if (newData.imageUrl) {
		await writeFile(
			newData.imageUrl.suggestedFilePath,
			new DataView(newData.imageUrl.body),
		);
	}

	if (Object.keys(newData).length === 0) {
		response.status(200).json({
			type: 'success',
			data: enrichInitiative(
				transformInitiativeUrls(oldRow),
				response.locals.login.id,
			),
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
			pdfUrl: newData.pdfUrl?.id,
			imageUrl: newData.imageUrl?.id,
		});

	response.status(200).send({
		type: 'success',
		data: getInitiative(id, response.locals.login.id),
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
			{pdfUrl: string; imageUrl: string}
		>('SELECT pdfUrl, imageUrl FROM initiatives WHERE id = :id')
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
	personId: string;
}> = (request, response) => {
	try {
		database
			.prepare<{
				initiativeId: string;
				personId: string;
			}>(
				'INSERT INTO signatures (initiativeId, personId) values (:initiativeId, :personId);',
			)
			.run(request.params);
		response.status(201).json({
			type: 'success',
		});
	} catch {
		response.status(404).json({
			type: 'error',
			error: 'not-found',
			readableError: 'Initiative or person not found',
		});
	}
};

export const initiativeRemoveSignature: RequestHandler<{
	initiativeId: string;
	personId: string;
}> = (request, response) => {
	const result = database
		.prepare<{
			initiativeId: string;
			personId: string;
		}>(
			'DELETE FROM signatures where initiativeId = :initiativeId AND personId = :personId;',
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

export const initiativeAddOrganisation: RequestHandler<{
	initiativeId: string;
	organisationId: string;
}> = (request, response) => {
	database
		.prepare<{
			initiativeId: string;
			organisationId: string;
		}>(
			'INSERT INTO initiativeOrganisations (initiativeId, organisationId) values (:initiativeId, :organisationId);',
		)
		.run(request.params);

	response.status(201).json({
		type: 'success',
	});
};

export const initiativeRemoveOrganisation: RequestHandler<{
	initiativeId: string;
	organisationId: string;
}> = (request, response) => {
	const result = database
		.prepare<{
			initiativeId: string;
			organisationId: string;
		}>(
			'DELETE FROM initiativeOrganisations where initiativeId = :initiativeId AND organisationId = :organisationId;',
		)
		.run(request.params);

	if (result.changes === 0) {
		response.status(404).json({
			type: 'error',
			readableError: "Organisation wasn't associated with initiative.",
			error: 'not-found',
		});
		return;
	}

	response.status(200).json({
		type: 'success',
	});
};

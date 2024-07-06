import {unlink, writeFile} from 'node:fs/promises';

import {Router, type Request, type RequestHandler} from 'express';
import {makeSlug} from '@lusc/initiatives-tracker-util/slug.js';
import {
	sortInitiatives,
	sortOrganisations,
} from '@lusc/initiatives-tracker-util/sort.js';
import {typeOf} from '@lusc/initiatives-tracker-util/type-of.js';
import type {
	Initiative,
	Organisation,
	EnrichedOrganisation,
	ApiResponse,
} from '@lusc/initiatives-tracker-util/types.js';

import {makeValidator, validateUrl} from '../validate-body.ts';
import {
	fetchImage,
	imageOutDirectory,
	mergeExpressBodyFile,
	transformInitiativeUrls,
	transformOrganisationUrls,
	type FetchedFile,
} from '../uploads.ts';
import {database} from '../db.ts';
import {requireAdmin} from '../middle-ware/require-admin.ts';

function enrichOrganisation(organisation: Organisation): EnrichedOrganisation {
	const id = organisation.id;

	const initiatives = database
		.prepare<{organisationId: string}, Initiative>(
			`SELECT initiatives.* FROM initiatives
			INNER JOIN initiativeOrganisations
			ON initiativeOrganisations.initiativeId = initiatives.id
			WHERE initiativeOrganisations.organisationId = :organisationId`,
		)
		.all({organisationId: id});

	return {
		...organisation,
		signatures: sortInitiatives(initiatives).map(initiative =>
			transformInitiativeUrls(initiative),
		),
	};
}

const organisationKeyValidators = {
	name(nameRaw: unknown): ApiResponse<string> {
		if (typeof nameRaw !== 'string') {
			return {
				type: 'error',
				readableError: `Invalid type for name. Expected string, got ${typeOf(nameRaw)}`,
				error: 'invalid-type',
			};
		}

		const name = nameRaw.trim();

		if (name.length < 4) {
			return {
				type: 'error',
				readableError: 'Name must be at least four characters long',
				error: 'name-too-short',
			};
		}

		if (!/^[a-züöäéèëï][a-züöäéèëï\d\-/()* .]+$/i.test(name)) {
			return {
				type: 'error',
				readableError: 'Name must contain only latin letters.',
				error: 'name-invalid-characters',
			};
		}

		return {
			type: 'success',
			data: name,
		};
	},
	async image(
		image: unknown,
	): Promise<
		ApiResponse<null | {id: string; suggestedFilePath: URL; body: ArrayBuffer}>
	> {
		if (
			image === null
			|| image === 'null'
			|| (typeof image === 'string' && image.trim() === '')
		) {
			return {
				type: 'success',
				data: null,
			};
		}

		try {
			let localImage: FetchedFile;

			if (Buffer.isBuffer(image)) {
				localImage = await fetchImage(image);
			} else {
				const isValidUrl = await validateUrl('Image URL', image);
				if (isValidUrl.type === 'error') {
					return isValidUrl;
				}

				localImage = await fetchImage(new URL(image as string));
			}

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

	async website(website: unknown): Promise<ApiResponse<string | null>> {
		if (
			website === null
			|| website === 'null'
			|| (typeof website === 'string' && website.trim() === '')
		) {
			return {
				type: 'success',
				data: null,
			};
		}

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
};

const organisationValidator = makeValidator(organisationKeyValidators);

export async function createOrganisation(
	request: Request,
): Promise<ApiResponse<EnrichedOrganisation>> {
	const body = mergeExpressBodyFile(request, ['image']);

	const result = await organisationValidator(body, [
		'name',
		'image',
		'website',
	]);

	if (result.type === 'error') {
		return result;
	}

	const {name, image, website} = result.data;
	if (image) {
		await writeFile(image.suggestedFilePath, new DataView(image.body));
	}

	const id = makeSlug(name);
	const organisation: Organisation = {
		id,
		name,
		image: image ? image.id : image,
		website,
	};

	database
		.prepare<Organisation>(
			`
		INSERT INTO organisations (id, name, image, website)
		values (:id, :name, :image, :website)
	`,
		)
		.run(organisation);

	return {
		type: 'success',
		data: enrichOrganisation(transformOrganisationUrls(organisation)),
	};
}

export const createOrganisationEndpoint: RequestHandler = async (
	request,
	response,
) => {
	const result = await createOrganisation(request);

	if (result.type === 'error') {
		response.status(400).json(result);
		return;
	}

	response.status(201).json(result);
};

export function getAllOrganisations() {
	const rows = database
		.prepare<
			[],
			Organisation
		>('SELECT id, name, image, website FROM organisations')
		.all();

	return sortOrganisations(rows).map(organisation =>
		enrichOrganisation(transformOrganisationUrls(organisation)),
	);
}

export const getAllOrganisationsEndpoint: RequestHandler = (
	_request,
	response,
) => {
	response.status(200).json({
		type: 'success',
		data: getAllOrganisations(),
	});
};

export function getOrganisation(id: string) {
	const organisation = database
		.prepare<
			{id: string},
			Organisation
		>('SELECT id, name, website, image FROM organisations WHERE id = :id')
		.get({
			id,
		});

	if (!organisation) {
		return false;
	}

	return enrichOrganisation(transformOrganisationUrls(organisation));
}

export const getOrganisationEndpoint: RequestHandler<{id: string}> = (
	request,
	response,
) => {
	const result = getOrganisation(request.params.id);
	if (!result) {
		return response.status(404).json({
			type: 'error',
			readableError: 'Organisation does not exist.',
			error: 'not-found',
		});
	}

	return response.status(200).json({
		type: 'success',
		data: result,
	});
};

export const deleteOrganisation: RequestHandler<{id: string}> = async (
	request,
	response,
) => {
	const {id} = request.params;

	const result = database
		.prepare<{id: string}>('DELETE FROM organisations WHERE id = :id')
		.run({id});

	if (result.changes === 0) {
		response.status(404).json({
			type: 'error',
			readableError: 'Organisation does not exist.',
			error: 'not-found',
		});
		return;
	}

	response.status(200).json({
		type: 'success',
	});
};

export const patchOrganisation: RequestHandler<{id: string}> = async (
	request,
	response,
) => {
	const {id} = request.params;

	const oldRow = database
		.prepare<
			{id: string},
			Organisation
		>('SELECT id, name, image, website FROM organisations WHERE id = :id')
		.get({id});

	if (!oldRow) {
		response.status(404).json({
			type: 'error',
			readableError: 'Organisation does not exist.',
			error: 'not-found',
		});
		return;
	}

	const body = mergeExpressBodyFile(request, ['image']);

	const validateResult = await organisationValidator(
		body,
		Object.keys(body) as Array<keyof typeof organisationKeyValidators>,
	);

	if (validateResult.type === 'error') {
		response.status(400).json(validateResult);
		return;
	}

	const newData = validateResult.data;

	if (newData.image) {
		if (oldRow.image !== null) {
			try {
				await unlink(new URL(oldRow.image, imageOutDirectory));
			} catch {}
		}

		await writeFile(
			newData.image.suggestedFilePath,
			new DataView(newData.image.body),
		);
	}

	if (Object.keys(newData).length === 0) {
		response.status(200).json({
			type: 'success',
			data: enrichOrganisation(transformOrganisationUrls(oldRow)),
		});
		return;
	}

	const query = [];

	for (const key of Object.keys(newData)) {
		query.push(`${key} = :${key}`);
	}

	database
		.prepare<Organisation>(
			`UPDATE organisations SET ${query.join(', ')} WHERE id = :id`,
		)
		.run({
			...newData,
			id,
			image: newData.image ? newData.image.id : null,
		});

	response.status(200).send({
		type: 'success',
		data: transformOrganisationUrls({
			...oldRow,
			...newData,
			image: newData.image ? newData.image.id : null,
		}),
	});
};

// eslint-disable-next-line new-cap
export const organisationRouter = Router();

organisationRouter.get('/organisations', getAllOrganisationsEndpoint);
organisationRouter.post(
	'/organisation/create',
	requireAdmin(),
	createOrganisationEndpoint,
);
organisationRouter.get('/organisation/:id', getOrganisationEndpoint);
organisationRouter.delete(
	'/organisation/:id',
	requireAdmin(),
	deleteOrganisation,
);
organisationRouter.patch(
	'/organisation/:id',
	requireAdmin(),
	patchOrganisation,
);

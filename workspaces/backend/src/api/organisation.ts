import {unlink, writeFile} from 'node:fs/promises';

import {Router, type RequestHandler} from 'express';
import {makeSlug} from '@lusc/initiatives-tracker-util/slug.js';
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
	transformInitiativeUrls,
	transformOrganisationUrls,
} from '../paths.ts';
import {database} from '../db.ts';
import {requireAdmin} from '../middle-ware/require-admin.ts';

function enrichOrganisation(organisation: Organisation): EnrichedOrganisation {
	const id = organisation.id;

	const initiatives = database
		.prepare<{organisationId: string}, Initiative>(
			`SELECT initiatives.* FROM initiatives
			INNER JOIN initiativeOrganisations
			on initiativeOrganisations.initiativeId = initiatives.id
			where initiativeOrganisations.organisationId = :organisationId`,
		)
		.all({organisationId: id});

	return {
		...organisation,
		signatures: initiatives.map(initiative =>
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

		if (!/^[a-züöäéèëï][a-züöäéèëï\d\-/() .]+$/i.test(name)) {
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
	async imageUrl(
		imageUrl: unknown,
	): Promise<
		ApiResponse<null | {id: string; suggestedFilePath: URL; body: ArrayBuffer}>
	> {
		if (
			imageUrl === null
			|| imageUrl === 'null'
			|| (typeof imageUrl === 'string' && imageUrl.trim() === '')
		) {
			return {
				type: 'success',
				data: null,
			};
		}

		const isValidUrl = await validateUrl('Image URL', imageUrl);
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
	body: Record<string, unknown>,
): Promise<ApiResponse<EnrichedOrganisation>> {
	const result = await organisationValidator(body, [
		'name',
		'imageUrl',
		'website',
	]);

	if (result.type === 'error') {
		return result;
	}

	const {name, imageUrl, website} = result.data;
	if (imageUrl) {
		await writeFile(imageUrl.suggestedFilePath, new DataView(imageUrl.body));
	}

	const id = makeSlug(name);
	const organisation: Organisation = {
		id,
		name,
		imageUrl: imageUrl ? imageUrl.id : imageUrl,
		website,
	};

	database
		.prepare<Organisation>(
			`
		INSERT INTO organisations (id, name, imageUrl, website)
		values (:id, :name, :imageUrl, :website)
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
	const result = await createOrganisation(
		request.body as Record<string, unknown>,
	);

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
		>('SELECT id, name, imageUrl, website FROM organisations')
		.all();

	return rows.map(organisation =>
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
		>('SELECT id, name, website, imageUrl FROM organisations WHERE id = :id')
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
		>('SELECT id, name, imageUrl, website FROM organisations WHERE id = :id')
		.get({id});

	if (!oldRow) {
		response.status(404).json({
			type: 'error',
			readableError: 'Organisation does not exist.',
			error: 'not-found',
		});
		return;
	}

	const body = request.body as Record<string, unknown>;
	const validateResult = await organisationValidator(
		body,
		Object.keys(body) as Array<keyof typeof organisationKeyValidators>,
	);

	if (validateResult.type === 'error') {
		response.status(400).json(validateResult);
		return;
	}

	const newData = validateResult.data;

	if (newData.imageUrl) {
		await writeFile(
			newData.imageUrl.suggestedFilePath,
			new DataView(newData.imageUrl.body),
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
		if (key === 'imageUrl' && oldRow.imageUrl !== null) {
			try {
				// eslint-disable-next-line no-await-in-loop
				await unlink(new URL(oldRow.imageUrl, imageOutDirectory));
			} catch {}
		}

		query.push(`${key} = :${key}`);
	}

	database
		.prepare(`UPDATE organisations SET ${query.join(', ')} WHERE id = :id`)
		.run({
			...newData,
			id,
			imageUrl: newData.imageUrl ? newData.imageUrl.id : null,
		});

	response.status(200).send({
		type: 'success',
		data: transformOrganisationUrls({
			...oldRow,
			...newData,
			imageUrl: newData.imageUrl ? newData.imageUrl.id : null,
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

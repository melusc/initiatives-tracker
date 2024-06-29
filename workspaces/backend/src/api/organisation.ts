import {unlink, writeFile} from 'node:fs/promises';

import type {RequestHandler} from 'express';
import {makeSlug} from '@lusc/initiatives-tracker-util/slug.js';
import {typeOf} from '@lusc/initiatives-tracker-util/type-of.js';
import type {
	Initiative,
	Organisation,
	EnrichedOrganisation,
	ApiResponse,
} from '@lusc/initiatives-tracker-util/types.js';

import {makeValidator, validateUrl} from '../validate-body.ts';
import {fetchImage, imageOutDirectory, transformImageUrl} from '../paths.ts';
import {database} from '../db.ts';

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
		signatures: initiatives,
	};
}

function transformOrganisationUrls(organisation: Organisation): Organisation {
	return {
		...organisation,
		image:
			organisation.image === null
				? null
				: transformImageUrl(organisation.image),
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

		if (!/^[a-züöäéèëï][a-züöäéèëï\d\- .]+$/i.test(name)) {
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
		imageUrl: unknown,
	): Promise<
		ApiResponse<null | {id: string; suggestedFilePath: URL; body: ArrayBuffer}>
	> {
		if (imageUrl === null || imageUrl === 'null') {
			return {
				type: 'success',
				data: null,
			};
		}

		const isValidUrl = await validateUrl('image', imageUrl);
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

	async homepage(homepage: unknown): Promise<ApiResponse<string | null>> {
		if (homepage === null || homepage === 'null') {
			return {
				type: 'success',
				data: null,
			};
		}

		const isValidUrl = await validateUrl('homepage', homepage);
		if (isValidUrl.type === 'error') {
			return isValidUrl;
		}

		const homepageUrl = new URL(homepage as string);
		homepageUrl.hash = '';
		homepageUrl.username = '';
		homepageUrl.password = '';

		return {
			type: 'success',
			data: homepageUrl.href,
		};
	},
};

const organisationValidator = makeValidator(organisationKeyValidators);

export const createOrganisation: RequestHandler = async (request, response) => {
	const body = request.body as Record<string, unknown>;
	const result = await organisationValidator(body, [
		'name',
		'image',
		'homepage',
	]);

	if (result.type === 'error') {
		response.status(400).json(result);
		return;
	}

	const {name, image, homepage} = result.data;
	if (image) {
		await writeFile(image.suggestedFilePath, new DataView(image.body));
	}

	const id = makeSlug(name);
	const organisation: Organisation = {
		id,
		name,
		image: image ? image.id : image,
		homepage,
	};

	database
		.prepare<Organisation>(
			`
		INSERT INTO organisations (id, name, image, homepage)
		values (:id, :name, :image, :homepage)
	`,
		)
		.run(organisation);

	response.status(201).json({
		type: 'success',
		data: enrichOrganisation(transformOrganisationUrls(organisation)),
	});
};

export const getAllOrganisations: RequestHandler = (_request, response) => {
	const rows = database
		.prepare<
			[],
			Organisation
		>('SELECT id, name, image, homepage FROM organisations')
		.all();

	response.status(200).json({
		type: 'success',
		data: rows.map(organisation =>
			enrichOrganisation(transformOrganisationUrls(organisation)),
		),
	});
};

export const getOrganisation: RequestHandler<{id: string}> = (
	request,
	response,
) => {
	const organisation = database
		.prepare<
			{id: string},
			Organisation
		>('SELECT id, name, homepage, image FROM organisations WHERE id = :id')
		.get({
			id: request.params.id,
		});

	if (!organisation) {
		return response.status(404).json({
			type: 'error',
			readableError: 'Organisation does not exist.',
			error: 'not-found',
		});
	}

	return response.status(200).json({
		type: 'success',
		data: enrichOrganisation(transformOrganisationUrls(organisation)),
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
		>('SELECT id, name, image, homepage FROM organisations WHERE id = :id')
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

	if (newData.image) {
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
		if (key === 'image' && oldRow.image !== null) {
			try {
				// eslint-disable-next-line no-await-in-loop
				await unlink(new URL(oldRow.image, imageOutDirectory));
			} catch {}
		}

		query.push(`${key} = :${key}`);
	}

	database
		.prepare(`UPDATE organisations SET ${query.join(', ')} WHERE id = :id`)
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

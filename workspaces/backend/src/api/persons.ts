import {makeSlug} from '@lusc/initiatives-tracker-util/slug.js';
import {typeOf} from '@lusc/initiatives-tracker-util/type-of.js';
import type {RequestHandler} from 'express';
import type {
	EnrichedPerson,
	Initiative,
	Person,
	ApiResponse,
} from '@lusc/initiatives-tracker-util/types.js';

import {database} from '../db.ts';
import {makeValidator} from '../validate-body.ts';

function enrichPerson(person: Person): EnrichedPerson {
	const initiatives = database
		.prepare<{personId: string}, Initiative>(
			`SELECT initiatives.* FROM initiatives
			INNER JOIN signatures on signatures.initiativeId = initiatives.id
			WHERE signatures.personId = :personId`,
		)
		.all({personId: person.id});

	return {
		...person,
		initiatives,
	};
}

const personKeyValidators = {
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
};

const personValidator = makeValidator(personKeyValidators);

export async function createPerson(
	body: Record<string, unknown>,
): Promise<ApiResponse<EnrichedPerson>> {
	const result = await personValidator(body, ['name']);

	if (result.type === 'error') {
		return result;
	}

	const {name} = result.data;

	const id = makeSlug(name);
	try {
		database
			.prepare<Person>('INSERT INTO people (id, name) values (:id, :name)')
			.run({
				id,
				name,
			});
	} catch {
		return {
			type: 'error',
			readableError: 'Person with that name already exists',
			error: 'person-already-exists',
		};
	}

	return {
		type: 'success',
		data: enrichPerson({
			id,
			name,
		}),
	};
}

export const createPersonEndpoint: RequestHandler = async (
	request,
	response,
) => {
	const result = await createPerson(request.body as Record<string, unknown>);

	if (result.type === 'error') {
		response
			.status(result.error === 'person-already-exists' ? 409 : 400)
			.json(result);
		return;
	}

	return response.status(201).json(result);
};

export function getPerson(id: string): EnrichedPerson | false {
	const person = database
		.prepare<{id: string}, Person>('SELECT id, name FROM people WHERE id = :id')
		.get({
			id,
		});

	if (!person) {
		return false;
	}

	return enrichPerson(person);
}

export const getPersonEndpoint: RequestHandler<{id: string}> = (
	request,
	response,
) => {
	const result = getPerson(request.params.id);

	if (!result) {
		return response.status(404).json({
			type: 'error',
			readableError: 'Person does not exist.',
			error: 'not-found',
		});
	}

	return response.status(200).json({
		type: 'success',
		data: result,
	});
};

export const patchPerson: RequestHandler<{id: string}> = async (
	request,
	response,
) => {
	const {id} = request.params;

	const oldRow = database
		.prepare<{id: string}, Person>('SELECT id, name FROM people WHERE id = :id')
		.get({id});

	if (!oldRow) {
		response.status(404).json({
			type: 'error',
			readableError: 'Person does not exist.',
			error: 'not-found',
		});
		return;
	}

	const body = request.body as Record<string, unknown>;

	const validateResult = await personValidator(
		body,
		Object.keys(body) as Array<keyof typeof personKeyValidators>,
	);

	if (validateResult.type === 'error') {
		response.status(400).json(validateResult);
		return;
	}

	const newData = validateResult.data;

	if (Object.keys(newData).length === 0) {
		response.status(200).json({
			type: 'success',
			data: enrichPerson(oldRow),
		});
		return;
	}

	const query = [];

	for (const key of Object.keys(newData)) {
		query.push(`${key} = :${key}`);
	}

	try {
		database
			.prepare(`UPDATE people SET ${query.join(', ')} WHERE id = :id`)
			.run({
				...newData,
				id,
			});

		response.status(200).send({
			type: 'success',
			data: enrichPerson({
				id,
				...newData,
			}),
		});
	} catch {
		response.status(409).json({
			type: 'error',
			error: 'unique-name',
			readableError: 'Person with that name already exists.',
		});
	}
};

export const deletePerson: RequestHandler<{id: string}> = async (
	request,
	response,
) => {
	const {id} = request.params;

	const result = database
		.prepare<{id: string}>('DELETE FROM people WHERE id = :id')
		.run({id});

	if (result.changes === 0) {
		response.status(404).json({
			type: 'error',
			readableError: 'Person does not exist.',
			error: 'not-found',
		});
		return;
	}

	response.status(200).json({
		type: 'success',
	});
};

export function getAllPeople() {
	const rows = database
		.prepare<[], Person>('SELECT id, name from people')
		.all();

	return rows.map(person => enrichPerson(person));
}

export const getAllPeopleEndpoint: RequestHandler = async (
	_request,
	response,
) => {
	response.status(200).json({
		type: 'success',
		data: getAllPeople(),
	});
};

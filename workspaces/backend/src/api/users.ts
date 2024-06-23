import {makeSlug} from '@lusc/initiatives-tracker-util/slug.js';
import {typeOf} from '@lusc/initiatives-tracker-util/type-of.js';
import type {RequestHandler} from 'express';
import type {
	EnrichedUser,
	Initiative,
	User,
	ApiResponse,
} from '@lusc/initiatives-tracker-util/types.js';

import {database} from '../db.ts';
import {makeValidator} from '../validate-body.ts';

function enrichUser(user: User): EnrichedUser {
	const initiatives = database
		.prepare<{userId: string}, Initiative>(
			`SELECT initiatives.* FROM initiatives
			INNER JOIN signatures on signatures.initiativeId = initiatives.id
			WHERE signatures.userId = :userId`,
		)
		.all({userId: user.id});

	return {
		...user,
		initiatives,
	};
}

const userKeyValidators = {
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

const userValidator = makeValidator(userKeyValidators);

export async function createUser(
	body: Record<string, unknown>,
): Promise<ApiResponse<EnrichedUser>> {
	const result = await userValidator(body, ['name']);

	if (result.type === 'error') {
		return result;
	}

	const {name} = result.data;

	const id = makeSlug(name);
	try {
		database
			.prepare<User>('INSERT INTO users (id, name) values (:id, :name)')
			.run({
				id,
				name,
			});
	} catch {
		return {
			type: 'error',
			readableError: 'User with that name already exists',
			error: 'user-already-exists',
		};
	}

	return {
		type: 'success',
		data: enrichUser({
			id,
			name,
		}),
	};
}

export const createUserEndpoint: RequestHandler = async (request, response) => {
	const result = await createUser(request.body as Record<string, unknown>);

	if (result.type === 'error') {
		response
			.status(result.error === 'user-already-exists' ? 409 : 400)
			.json(result);
		return;
	}

	return response.status(201).json(result);
};

export function getUser(id: string): EnrichedUser | false {
	const user = database
		.prepare<{id: string}, User>('SELECT id, name FROM users WHERE id = :id')
		.get({
			id,
		});

	if (!user) {
		return false;
	}

	return enrichUser(user);
}

export const getUserEndpoint: RequestHandler<{id: string}> = (
	request,
	response,
) => {
	const result = getUser(request.params.id);

	if (!result) {
		return response.status(404).json({
			type: 'error',
			readableError: 'User does not exist.',
			error: 'not-found',
		});
	}

	return response.status(200).json({
		type: 'success',
		data: result,
	});
};

export const patchUser: RequestHandler<{id: string}> = async (
	request,
	response,
) => {
	const {id} = request.params;

	const oldRow = database
		.prepare<{id: string}, User>('SELECT id, name FROM users WHERE id = :id')
		.get({id});

	if (!oldRow) {
		response.status(404).json({
			type: 'error',
			readableError: 'User does not exist.',
			error: 'not-found',
		});
		return;
	}

	const body = request.body as Record<string, unknown>;

	const validateResult = await userValidator(
		body,
		Object.keys(body) as Array<keyof typeof userKeyValidators>,
	);

	if (validateResult.type === 'error') {
		response.status(400).json(validateResult);
		return;
	}

	const newData = validateResult.data;

	if (Object.keys(newData).length === 0) {
		response.status(200).json({
			type: 'success',
			data: enrichUser(oldRow),
		});
		return;
	}

	const query = [];

	for (const key of Object.keys(newData)) {
		query.push(`${key} = :${key}`);
	}

	try {
		database
			.prepare(`UPDATE users SET ${query.join(', ')} WHERE id = :id`)
			.run({
				...newData,
				id,
			});

		response.status(200).send({
			type: 'success',
			data: enrichUser({
				id,
				...newData,
			}),
		});
	} catch {
		response.status(409).json({
			type: 'error',
			error: 'unique-name',
			readableError: 'User with that name already exists.',
		});
	}
};

export const deleteUser: RequestHandler<{id: string}> = async (
	request,
	response,
) => {
	const {id} = request.params;

	const result = database
		.prepare<{id: string}>('DELETE FROM users WHERE id = :id')
		.run({id});

	if (result.changes === 0) {
		response.status(404).json({
			type: 'error',
			readableError: 'User does not exist.',
			error: 'not-found',
		});
		return;
	}

	response.status(200).json({
		type: 'success',
	});
};

export function getAllUsers() {
	const rows = database.prepare<[], User>('SELECT id, name from users').all();

	return rows.map(user => enrichUser(user));
}

export const getAllUsersEndpoint: RequestHandler = async (
	_request,
	response,
) => {
	response.status(200).json({
		type: 'success',
		data: getAllUsers(),
	});
};

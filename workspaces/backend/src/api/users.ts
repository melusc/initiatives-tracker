import {makeSlug} from '@lusc/initiatives-tracker-util/slug.js';
import {typeOf} from '@lusc/initiatives-tracker-util/type-of.js';
import type {RequestHandler} from 'express';
import {database} from '../db.ts';
import {makeValidator} from '../validate-body.ts';
import type {ApiResponse} from './response.d.ts';

export type User = {
	name: string;
	id: string;
};

// TODO: function addSignatures

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

export const createUser: RequestHandler = async (request, response) => {
	const result = await userValidator(request.body as Record<string, unknown>, [
		'name',
	]);

	if (result.type === 'error') {
		response.status(400).json(result);
		return;
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
		return response.status(409).json({
			type: 'error',
			readableError: 'User with that name already exists',
			error: 'user-already-exists',
		});
	}

	return response.status(201).json({
		type: 'success',
		data: {
			id,
			name,
		},
	});
};

export const getUser: RequestHandler<{id: string}> = (request, response) => {
	const user = database
		.prepare<{id: string}, User>('SELECT id, name FROM users WHERE id = :id')
		.get({
			id: request.params.id,
		});

	if (!user) {
		return response.status(404).json({
			type: 'error',
			readableError: 'User does not exist.',
			error: 'not-found',
		});
	}

	return response.status(200).json({
		type: 'success',
		data: user,
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
			data: oldRow,
		});
		return;
	}

	const query = [];

	for (const key of Object.keys(newData)) {
		query.push(`${key} = :${key}`);
	}

	database.prepare(`UPDATE users SET ${query.join(', ')} WHERE id = :id`).run({
		...newData,
		id,
	});

	response.status(200).send({
		type: 'success',
		data: {
			id,
			...newData,
		},
	});
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

export const getAllUsers: RequestHandler = async (_request, response) => {
	const rows = database.prepare<[], User>('SELECT id, name from users').all();

	response.status(200).json({
		type: 'success',
		data: rows,
	});
};

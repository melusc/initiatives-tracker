import {randomBytes, timingSafeEqual} from 'node:crypto';

import type {Request, Response} from 'express';
import z from 'zod';
import {RelativeUrl} from '@lusc/initiatives-tracker-util/relative-url.js';

import {database} from '../db.ts';
import {scrypt} from '../promisified.ts';

export async function loginPost(request: Request, response: Response) {
	const body = z
		.object({
			username: z.string().min(1),
			password: z.string().min(1),
		})
		.safeParse(request.body);

	if (!body.success) {
		response.render('login', {
			state: {
				error: 'missing-values',
			},
		});
		return;
	}

	const databaseResult = database
		.prepare<
			[string],
			{userId: string; passwordHash: Buffer; passwordSalt: Buffer}
		>('SELECT userId, passwordHash, passwordSalt from logins where username = ?')
		.get(body.data.username);

	if (!databaseResult) {
		response.render('login', {
			state: {
				error: 'incorrect-credentials',
			},
		});
		return;
	}

	const {userId, passwordSalt, passwordHash} = databaseResult;
	const requestHash = await scrypt(body.data.password, passwordSalt, 64);

	if (!timingSafeEqual(passwordHash, requestHash)) {
		response.render('login', {
			state: {
				error: 'incorrect-credentials',
			},
		});
		return;
	}

	const sessionId = randomBytes(64).toString('hex');

	const expires = new Date();
	expires.setDate(expires.getDate() + 7);
	// Cookie should expire a bit earlier
	// so cookie will never be valid while actual session id is not
	const cookieExpires = new Date(expires.getTime());
	cookieExpires.setHours(cookieExpires.getMinutes() - 5);

	database
		.prepare<
			[string, string, number]
		>('INSERT INTO sessions (userId, sessionId, expires) values (?, ?, ?)')
		.run(userId, sessionId, expires.getTime());

	response.cookie('session', sessionId, {
		expires: cookieExpires,
		httpOnly: true,
	});

	if (request.search.has('redirect')) {
		// Avoid redirects to other websites
		const redirectUrl = new RelativeUrl(request.search.get('redirect')!);

		response.redirect(302, redirectUrl.path);
	} else {
		response.redirect(302, '/');
	}
}

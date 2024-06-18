import type {Request, Response} from 'express';

import {database} from '../db.ts';

export function logout(request: Request, response: Response) {
	const session = request.cookies['session'] as string | undefined;

	if (typeof session === 'string') {
		database
			.prepare<{
				session: string;
			}>('DELETE FROM sessions WHERE sessionId = :session')
			.run({session});
	}

	response
		.clearCookie('session', {
			httpOnly: true,
		})
		.redirect(302, '/');
}

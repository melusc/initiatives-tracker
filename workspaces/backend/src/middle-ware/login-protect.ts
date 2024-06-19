import type {LoginInfo} from '@lusc/initiatives-tracker-util/types.js';
import type {Database} from 'better-sqlite3';
import type {RequestHandler} from 'express';
import {z} from 'zod';

export function loginProtect(
	allowedPaths: Set<string> | string[],
	database: Database,
): RequestHandler {
	return (request, response, next) => {
		allowedPaths = new Set(allowedPaths);

		const segments = request.path.split('/');
		// '/path/...'.split is ['', 'path', ...]
		const firstSegment = segments[1];

		if (allowedPaths.has(firstSegment!)) {
			next();
			return;
		}

		const cookies = z
			.object({
				session: z.string(),
			})
			.safeParse(request.cookies);

		if (cookies.success) {
			const sessionCookie = cookies.data.session;

			const session = database
				.prepare<
					[string],
					{userId: string; expires: number}
				>('SELECT userId, expires FROM sessions WHERE sessionId = ?')
				.get(sessionCookie);

			if (session && session.expires > Date.now()) {
				const user = database
					.prepare<
						[string],
						{username: string; isAdmin: 0 | 1}
					>('SELECT username, isAdmin FROM logins WHERE userId = ?')
					.get(session.userId)!;

				// @ts-expect-error .user is readonly anywhere else
				response.locals.user = {
					name: user.username,
					id: session.userId,
					isAdmin: user.isAdmin === 1,
					iconKey: user.username + session.userId,
				} satisfies LoginInfo;

				next();
				return;
			}
		}

		const searchParameters = new URLSearchParams({
			redirect: request.url,
		});
		response.clearCookie('session', {
			httpOnly: true,
		});
		response.redirect(302, '/login?' + searchParameters.toString());
	};
}

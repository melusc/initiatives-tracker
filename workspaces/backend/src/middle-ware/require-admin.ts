import type {NextFunction, Request, Response} from 'express';

export function requireAdmin() {
	return (request: Request, response: Response, next: NextFunction) => {
		if (response.locals.login.isAdmin) {
			next();
			return;
		}

		response.status(401);

		if (request.accepts('html')) {
			response.render('401', {
				login: response.locals.login,
				state: undefined,
			});
			return;
		}

		response.json({
			type: 'error',
			readableError: 'Not an admin',
			error: 'not-an-admin',
		});
	};
}

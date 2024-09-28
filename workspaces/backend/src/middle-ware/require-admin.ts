/*!
Copyright (C) 2024  Luca Schnellmann

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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

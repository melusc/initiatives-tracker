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

import {fileURLToPath} from 'node:url';

import {Router} from 'express';

import {imageOutDirectory, pdfOutDirectory} from '../uploads.ts';

const router = Router();

router.get('/pdf/:id', (request, response, next) => {
	response.sendFile(
		request.params.id,
		{
			root: fileURLToPath(pdfOutDirectory),
		},
		() => {
			// 404
			next();
		},
	);
});

router.get('/image/:id', (request, response, next) => {
	response.sendFile(
		request.params.id,
		{
			root: fileURLToPath(imageOutDirectory),
		},
		() => {
			// 404
			next();
		},
	);
});

export {router as userContent};

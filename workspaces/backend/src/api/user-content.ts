import {fileURLToPath} from 'node:url';

import {Router} from 'express';

import {imageOutDirectory, pdfOutDirectory} from '../paths.ts';

// eslint-disable-next-line new-cap
const router = Router();

router.get('/pdf/:id', (request, response, next) => {
	response.sendFile(
		request.params.id,
		{
			root: fileURLToPath(pdfOutDirectory),
		},
		error => {
			if (error) {
				next();
			}
		},
	);
});

router.get('/image/:id', (request, response, next) => {
	response.sendFile(
		request.params.id,
		{
			root: fileURLToPath(imageOutDirectory),
		},
		error => {
			if (error) {
				next();
			}
		},
	);
});

export {router as userContent};

import {fileURLToPath} from 'node:url';
import {Router} from 'express';
import {imageOutDirectory, pdfOutDirectory} from '../paths.ts';

// eslint-disable-next-line new-cap
const router = Router();

router.get('/pdf/:id', (request, response) => {
	response.sendFile(request.params.id, {
		root: fileURLToPath(pdfOutDirectory),
	});
});

router.get('/image/:id', (request, response) => {
	response.sendFile(request.params.id, {
		root: fileURLToPath(imageOutDirectory),
	});
});

export {router as userContent};

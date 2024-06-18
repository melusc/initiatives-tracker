import {fileURLToPath} from 'node:url';
import {Router, type NextFunction, type Response} from 'express';

// eslint-disable-next-line new-cap
const router = Router();

const root = fileURLToPath(
	import.meta.resolve('@lusc/initiatives-tracker-frontend'),
);

export function sendStatic(path: string, response: Response, next: NextFunction) {
	response.sendFile(path, {root, index: false}, (err) => {
		if (err) {
			next()
		}
	});
}

router.get('*', (request, response, next) => {
	if (request.path.endsWith('.html')) {
		next();
		return;
	}

	sendStatic(request.path, response, next);
});

export {router as staticRouter};

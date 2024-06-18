import {fileURLToPath} from 'node:url';
import {Router, type Response} from 'express';

// eslint-disable-next-line new-cap
const router = Router();

const root = fileURLToPath(
	import.meta.resolve('@lusc/initiatives-tracker-frontend'),
);

router.get('*', (request, response, next) => {
	console.log({
		path: request.path
	})
	if (request.path.endsWith('.html')) {
		next();
		return;
	}

	response.sendFile(request.path, {root});
});

export function send404Html(response: Response) {
	response.sendFile('/404.html', {root})
}

export {router as staticRouter};

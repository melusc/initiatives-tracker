import {RelativeUrl} from '@lusc/initiatives-tracker-util/relative-url.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, {type Request, type Response} from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import {apiRouter} from './api/index.ts';
import {database} from './db.ts';
import {setHeaders} from './middle-ware/disable-interest-cohort.ts';
import {loginProtect} from './middle-ware/login-protect.ts';
import {staticRoot} from './paths.ts';
import {loginPost} from './routes/login.ts';
import {logout} from './routes/logout.ts';
import {svelteKitEngine} from './svelte-kit-engine.ts';
import {
	createInitiative,
	getAllInitiatives,
	getInitiative,
} from './api/initiative.ts';

const app = express();

function send404(request: Request, response: Response) {
	response.status(404);

	if (request.accepts('html')) {
		response.render('404', {user: response.locals.user, state: undefined});
		return;
	}

	// Respond with json
	if (request.accepts('json')) {
		response.json({
			type: 'error',
			error: 'not-found',
			readableError: `${request.method} ${request.path} not found`,
		});
		return;
	}

	// Default to plain-text. send()
	response.type('txt').send('Not found');
}

app.engine('html', svelteKitEngine);
app.set('view engine', 'html');
app.set('views', staticRoot);

app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				'script-src': ["'self'", "'unsafe-inline'"],
			},
		},
	}),
);
app.use(cors());
app.use(morgan('dev'));

app.use(
	setHeaders({
		'permissions-policy': 'interest-cohort=()',
	}),
);

app.use((request, response, next) => {
	const segments = request.path.split('/');
	if (segments.includes('..')) {
		response.status(418).type('txt').send('..');
		return;
	}

	next();
});

app.use((request, response, next) => {
	if (request.path.includes('\\')) {
		response
			.status(404)
			.render('404', {user: response.locals.user, state: undefined});
		return;
	}

	next();
});

app.get('/robots.txt', (_request, response) => {
	response
		.status(200)
		.type('txt')
		.send(
			`User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Disallow: /`,
		);
});

app.use(loginProtect(['login', 'static'], database));

app.use((request, _response, next) => {
	request.search = new RelativeUrl(request.url).searchParams;
	next();
});

app.use('/api', apiRouter);
app.use(
	'/static',
	express.static(staticRoot, {
		index: false,
	}),
);

app.get('/login', (_request, response) => {
	response.render('login', {user: response.locals.user, state: undefined});
});
app.post('/login', loginPost);

app.get('/logout', logout);

app.get('/', (_, response) => {
	response.render('index', {
		user: response.locals.user,
		state: getAllInitiatives(),
	});
});

app.get('/initiative/create', (_, response) => {
	response.render('create-initiative', {
		user: response.locals.user,
		state: {values: {}},
	});
});

app.post('/initiative/create', async (request, response) => {
	const body = request.body as Record<string, unknown>;

	const initiative = await createInitiative(body);

	if (initiative.type === 'error') {
		response.status(400).render('create-initiative', {
			user: response.locals.user,
			state: {
				error: initiative.readableError,
				values: body,
			},
		});
		return;
	}

	response.redirect(303, `/initiative/${initiative.data.id}`);
});

app.get('/initiative/:id', (request, response) => {
	const initiative = getInitiative(request.params.id);
	if (initiative) {
		response.status(200).render('initiative', {
			user: response.locals.user,
			state: initiative,
		});
	} else {
		response
			.status(404)
			.render('404', {user: response.locals.user, state: undefined});
	}
});

app.all('*', send404);

app.listen(3000, () => {
	console.log('Listening on http://localhost:3000/');
});

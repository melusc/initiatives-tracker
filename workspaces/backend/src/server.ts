import {RelativeUrl} from '@lusc/initiatives-tracker-util/relative-url.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import {apiRouter} from './api/index.ts';
import {
	createInitiative,
	getAllInitiatives,
	getInitiative,
} from './api/initiative.ts';
import {
	createOrganisation,
	getAllOrganisations,
	getOrganisation,
} from './api/organisation.ts';
import {createPerson, getAllPeople, getPerson} from './api/person.ts';
import {database} from './db.ts';
import {setHeaders} from './middle-ware/disable-interest-cohort.ts';
import {loginProtect} from './middle-ware/login-protect.ts';
import {staticRoot} from './paths.ts';
import {loginPost} from './routes/login.ts';
import {logout} from './routes/logout.ts';
import {svelteKitEngine} from './svelte-kit-engine.ts';
import {requireAdmin} from './middle-ware/require-admin.ts';

const app = express();

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
			.render('404', {login: response.locals.login, state: undefined});
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
	response.render('login', {login: undefined, state: undefined});
});
app.post('/login', loginPost);

app.get('/logout', logout);

app.get('/', (_, response) => {
	response.render('index', {
		login: response.locals.login,
		state: getAllInitiatives(response.locals.login.id),
	});
});

app.get('/initiative/create', requireAdmin(), (_, response) => {
	response.render('create-initiative', {
		login: response.locals.login,
		state: {values: {}},
	});
});

app.post('/initiative/create', requireAdmin(), async (request, response) => {
	const body = request.body as Record<string, unknown>;

	const initiative = await createInitiative(response.locals.login.id, body);

	if (initiative.type === 'error') {
		response.status(400).render('create-initiative', {
			login: response.locals.login,
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
	const initiative = getInitiative(request.params.id, response.locals.login.id);
	if (initiative) {
		response.status(200).render('initiative', {
			login: response.locals.login,
			state: initiative,
		});
	} else {
		response
			.status(404)
			.render('404', {login: response.locals.login, state: undefined});
	}
});

app.get('/people', (_request, response) => {
	const people = getAllPeople(response.locals.login.id);

	response.render('people', {
		state: people,
		login: response.locals.login,
	});
});

app.get('/person/create', (_, response) => {
	response.render('create-person', {
		login: response.locals.login,
		state: {values: {}},
	});
});

app.post('/person/create', async (request, response) => {
	const body = request.body as Record<string, unknown>;

	const person = await createPerson(body, response.locals.login.id);

	if (person.type === 'error') {
		response.status(400).render('create-person', {
			login: response.locals.login,
			state: {
				error: person.readableError,
				values: body,
			},
		});
		return;
	}

	response.redirect(303, `/person/${person.data.id}`);
});

app.get('/person/:id', (request, response) => {
	const person = getPerson(request.params.id, response.locals.login.id);
	if (person) {
		response.status(200).render('person', {
			login: response.locals.login,
			state: person,
		});
	} else {
		response
			.status(404)
			.render('404', {login: response.locals.login, state: undefined});
	}
});

app.get('/organisations', (_request, response) => {
	const organisations = getAllOrganisations();

	response.status(200).render('organisations', {
		login: response.locals.login,
		state: organisations,
	});
});

app.get('/organisation/create', requireAdmin(), (_, response) => {
	response.render('create-organisation', {
		login: response.locals.login,
		state: {values: {}},
	});
});

app.post('/organisation/create', requireAdmin(), async (request, response) => {
	const body = request.body as Record<string, unknown>;

	const organisation = await createOrganisation(body);

	if (organisation.type === 'error') {
		response.status(400).render('create-organisation', {
			login: response.locals.login,
			state: {
				error: organisation.readableError,
				values: body,
			},
		});
		return;
	}

	response.redirect(303, `/organisation/${organisation.data.id}`);
});

app.get('/organisation/:id', (request, response) => {
	const organisation = getOrganisation(request.params.id);
	if (organisation) {
		response.status(200).render('organisation', {
			login: response.locals.login,
			state: organisation,
		});
	} else {
		response
			.status(404)
			.render('404', {login: response.locals.login, state: undefined});
	}
});

app.use((_request, response) => {
	response
		.status(404)
		.render('404', {login: response.locals.login, state: undefined});
});

app.listen(3000, () => {
	console.log('Listening on http://localhost:3000/');
});

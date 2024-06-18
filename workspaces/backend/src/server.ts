import {RelativeUrl} from '@lusc/initiatives-tracker-util/relative-url.js';
import {colorHashSvg} from '@lusc/initiatives-tracker-util/color-hash.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import {apiRouter} from './api/index.ts';
import {database} from './db.ts';
import {setHeaders} from './middle-ware/disable-interest-cohort.ts';
import {loginProtect} from './middle-ware/login-protect.ts';
import {loginPost} from './routes/login.ts';
import {logout} from './routes/logout.ts';

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

app.use(
	setHeaders({
		'permissions-policy': 'interest-cohort=()',
	}),
);

app.use(loginProtect(['/login/', '/static/'], database));

app.use((request, _response, next) => {
	request.search = new RelativeUrl(request.url).searchParams;
	next();
});

app.use('/api', apiRouter);

app.get('/login', (request, response) => {
	const status = request.search.get('status');
	response.contentType('html');
	response.end(`<!doctype html>
		<form method="POST">
			<label>Username <input name="username" type="text" id="name"></label>
			<label>Password <input name="password" type="password" id="password"></label>

			<input type="submit" value="Submit">

			${status === 'incorrect-credentials' ? '<div>Incorrect credentials</div>' : ''}
			${status === 'missing-values' ? '<div>Some values are missing. Did you fill in all inputs?</div>' : ''}
		</form>
	`);
});
app.post('/login', loginPost);

app.get('/logout', logout);

app.get('/', (_, response) => {
	response.send(`
<!doctype html>
	<a href="/logout">Logout</a>
	${colorHashSvg(`${response.locals.user.username}-${response.locals.user.userId}`)}
`);
});

app.listen(3000, () => {
	console.log('Listening on http://localhost:3000/');
});

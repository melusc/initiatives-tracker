import {randomBytes, randomUUID} from 'node:crypto';
import {stdin, stdout} from 'node:process';
import {createInterface} from 'node:readline/promises';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';

import Database, {type Database as DatabaseT} from 'better-sqlite3';

import {dataDirectory} from './paths.ts';
import {scrypt} from './promisified.ts';

export const database: DatabaseT = new Database(
	fileURLToPath(new URL('initiatives-tracker.db', dataDirectory)),
);

const {
	values: {createLogin: shouldCreateLogin},
} = parseArgs({
	options: {
		createLogin: {
			type: 'boolean',
			short: 'c',
			default: false,
		},
		username: {
			type: 'string',
			short: 'u',
		},
	},
});

database.pragma('journal_mode = WAL');
database.pragma('foreign_keys = ON');

database.exec(
	`
		CREATE TABLE IF NOT EXISTS logins (
				userId TEXT PRIMARY KEY,
				username TEXT NOT NULL UNIQUE,
				passwordHash BLOB NOT NULL,
				passwordSalt BLOB NOT NULL,
				isAdmin BOOLEAN NOT NULL CHECK (isAdmin IN (0, 1))
		);

		CREATE TABLE IF NOT EXISTS sessions (
				sessionId TEXT PRIMARY KEY,
				userId TEXT NOT NULL,
				expires INTEGER NOT NULL,
				FOREIGN KEY(userId) REFERENCES logins(userId) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS people (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				owner TEXT NOT NULL,
				FOREIGN KEY(owner) REFERENCES logins(userId) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS initiatives (
				id TEXT PRIMARY KEY,
				shortName TEXT NOT NULL,
				fullName TEXT NOT NULL,
				website TEXT NOT NULL,
				pdfUrl TEXT NOT NULL,
				imageUrl TEXT NOT NULL,
				deadline TEXT NOT NULL
		);

		CREATE TABLE IF NOT EXISTS organisations (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				imageUrl TEXT,
				website TEXT
		);

		CREATE TABLE IF NOT EXISTS signatures (
				personId TEXT NOT NULL,
				initiativeId TEXT NOT NULL,
				PRIMARY KEY (personId, initiativeId),
				FOREIGN KEY(personId) REFERENCES people(id) ON DELETE CASCADE,
				FOREIGN KEY(initiativeId) REFERENCES initiatives(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS initiativeOrganisations (
				initiativeId TEXT NOT NULL,
				organisationId TEXT NOT NULL,
				PRIMARY KEY (initiativeId, organisationId),
				FOREIGN KEY(organisationId) REFERENCES organisations(id) ON DELETE CASCADE,
				FOREIGN KEY(initiativeId) REFERENCES initiatives(id) ON DELETE CASCADE
		);
	`,
);

database
	.prepare<{expires: number}>('DELETE FROM sessions WHERE expires < :expires')
	.run({expires: Date.now()});

if (shouldCreateLogin) {
	const rl = createInterface({
		input: stdin,
		output: stdout,
	});

	const username = await rl.question('Username: ');
	const password = await rl.question('Password: ');
	const isAdminAnswer = await rl.question('Admin? (y/n) ');
	const isAdmin = ['y', 'yes'].includes(isAdminAnswer.trim().toLowerCase());

	rl.close();

	const salt = randomBytes(64);
	const passwordHash = await scrypt(password, salt, 64);

	database
		.prepare<{
			userId: string;
			username: string;
			passwordHash: Buffer;
			salt: Buffer;
			isAdmin: 1 | 0;
		}>(
			`
			INSERT INTO logins
				(userId, username, passwordHash, passwordSalt, isAdmin)
				values
				(:userId, :username, :passwordHash, :salt, :isAdmin);
		`,
		)
		.run({
			userId: randomUUID(),
			username,
			passwordHash,
			salt,
			isAdmin: isAdmin ? 1 : 0,
		});

	console.log(
		'Created %s "%s"',
		isAdmin ? 'admin account' : 'account',
		username,
	);
}

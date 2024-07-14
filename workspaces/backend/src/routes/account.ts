import {type Buffer} from 'node:buffer';
import {randomBytes, timingSafeEqual} from 'node:crypto';

import {database} from '../db.ts';
import {scrypt} from '../promisified.ts';

export function changeUsername(username: string, userId: string) {
	username = username.trim();

	if (username.length < 4) {
		throw new Error('Username must contain at least 4 characters.');
	}

	if (!/^[a-z\d]+$/i.test(username)) {
		throw new Error('Username must only contain letters and numbers.');
	}

	database
		.prepare<{
			username: string;
			userId: string;
		}>('UPDATE logins SET username = :username WHERE userId = :userId')
		.run({username, userId});
}

export async function changePassword(
	userId: string,
	currentPassword: string,
	newPassword: string,
	newPasswordRepeat: string,
) {
	if (newPassword !== newPasswordRepeat) {
		throw new Error('Passwords did not match.');
	}

	if (
		!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\da-zA-Z]).{10,}/.test(newPassword)
	) {
		throw new Error('Password did not match criteria.');
	}

	const row = database
		.prepare<
			{userId: string},
			{
				passwordHash: Buffer;
				passwordSalt: Buffer;
			}
		>('SELECT passwordHash, passwordSalt FROM logins WHERE userId = :userId')
		.get({userId});

	if (!row) {
		throw new Error('Could not find account.');
	}

	const calculatedHash = await scrypt(currentPassword, row.passwordSalt, 64);

	if (!timingSafeEqual(calculatedHash, row.passwordHash)) {
		throw new Error('Current password was incorrect.');
	}

	const newSalt = randomBytes(64);
	const newHash = await scrypt(newPassword, newSalt, 64);

	database
		.prepare<{
			userId: string;
			passwordHash: Buffer;
			passwordSalt: Buffer;
		}>(
			'UPDATE logins SET passwordHash = :passwordHash, passwordSalt = :passwordSalt WHERE userId = :userId',
		)
		.run({
			userId,
			passwordHash: newHash,
			passwordSalt: newSalt,
		});
}

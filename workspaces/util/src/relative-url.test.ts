import assert from 'node:assert/strict';
import {test} from 'node:test';
import {RelativeUrl} from './relative-url.js';

await test('pathname only', () => {
	const u = new RelativeUrl('/abc');

	assert.equal(u.path, '/abc');
	assert.equal(u.full, '/abc');

	u.path = '/def';

	assert.equal(u.path, '/def');
	assert.equal(u.full, '/def');
});

await test('search', () => {
	const u = new RelativeUrl('?a=b');

	assert.equal(u.search, '?a=b');
	assert.equal(u.searchParams.get('a'), 'b');
	assert.equal(u.full, '/?a=b');

	u.searchParams.delete('a');
	assert.equal(u.search, '');

	u.search = 'b=c';
	assert.equal(u.search, '?b=c');
	assert.equal(u.searchParams.get('b'), 'c');
	assert.equal(u.full, '/?b=c');
});

await test('hash', () => {
	const u = new RelativeUrl('#abc');

	assert.equal(u.hash, '#abc');
	assert.equal(u.full, '/#abc');

	u.hash = '';

	assert.equal(u.hash, '');
	assert.equal(u.full, '/');

	u.hash = 'def';

	assert.equal(u.hash, '#def');
	assert.equal(u.full, '/#def');
});

await test('full', () => {
	const u = new RelativeUrl('/path?query=1#hash');

	assert.equal(u.path, '/path');
	assert.equal(u.search, '?query=1');
	assert.equal(u.hash, '#hash');
	assert.equal(u.full, '/path?query=1#hash');

	assert.throws(() => {
		// @ts-expect-error Is readonly
		u.full = '/';
	});
});

await test('Cloning', () => {
	const url = new URL('http://localhost/abc?query=1#h1');
	const rUrl = new RelativeUrl(url);

	assert.equal(rUrl.full, '/abc?query=1#h1');

	const rUrlClone = new RelativeUrl(rUrl);

	assert.equal(rUrlClone.full, '/abc?query=1#h1');

	assert.notEqual(rUrl, rUrlClone);
	assert.notEqual(rUrl.searchParams, rUrlClone.searchParams);
});

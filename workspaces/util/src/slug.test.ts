/* eslint-disable @typescript-eslint/naming-convention */

import test from 'node:test';
import assert from 'node:assert/strict';
import {makeSlug} from './slug.js';

function makeSlugDeterministic(s: string) {
	return makeSlug(s).split('-').slice(0, -1).join('-');
}

const tests = {
	ö: 'o',
	Ä: 'a',
	ß: 'ss',
	ñ: 'n',
	'Alpha Beta': 'alpha-beta',
	'a-  _  -__ -b': 'a-b',
	' a92 38do   ': 'a92-38do',
	'a-b-': 'a-b',
};

await test('makeSlug', () => {
	for (const [input, output] of Object.entries(tests)) {
		assert.equal(makeSlugDeterministic(input), output);
	}
});

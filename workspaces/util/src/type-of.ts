export function typeOf(value: unknown) {
	if (Array.isArray(value)) {
		return 'array';
	}

	if (value === null) {
		return 'null';
	}

	return typeof value;
}

export type TypeOf = ReturnType<typeof typeOf>;

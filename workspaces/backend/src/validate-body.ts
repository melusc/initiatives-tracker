import {typeOf} from '@lusc/initiatives-tracker-util/type-of.js';
import type {
	ApiResponse,
	ApiResponseError,
	ApiResponseSuccess,
} from '@lusc/initiatives-tracker-util/types.js';

export function isValidUrl(url: string) {
	if (!URL.canParse(url)) {
		return false;
	}

	const parsed = new URL(url);
	return parsed.protocol === 'http:' || parsed.protocol === 'https:';
}

type GenericValidator = Record<
	string,
	(value: unknown) => Promise<ApiResponse<unknown>> | ApiResponse<unknown>
>;

export function makeValidator<Validators extends GenericValidator>(
	validators: Validators,
) {
	const validKeysSet = new Set(Object.keys(validators));

	return async <Keys extends keyof Validators & string>(
		bodyUntyped: unknown,
		keys: Keys[],
	): Promise<
		| ApiResponseError
		| ApiResponseSuccess<{
				[K in Keys]: ReturnType<Validators[K]> extends ApiResponse<infer R>
					? R
					: ReturnType<Validators[K]> extends Promise<ApiResponse<infer R>>
						? R
						: never;
		  }>
	> => {
		if (typeOf(bodyUntyped) !== 'object') {
			return {
				type: 'error',
				readableError: `Invalid type of body. Expected object, got ${typeOf(bodyUntyped)}`,
				error: 'invalid-type',
			};
		}

		const result: Record<string, unknown> = {};
		const body = bodyUntyped as Record<string, unknown>;

		for (const key of Object.keys(body)) {
			if (!validKeysSet.has(key)) {
				return {
					type: 'error',
					readableError: `Unknown key "${key}".`,
					error: 'unknown-key',
				};
			}
		}

		for (const key of keys) {
			if (!(key in body)) {
				return {
					type: 'error',
					readableError: `Missing required field "${key}".`,
					error: 'missing-field',
				};
			}

			// eslint-disable-next-line no-await-in-loop
			const localResult = await validators[key]!(body[key]);
			if (localResult.type === 'error') {
				return localResult;
			}

			result[key] = localResult.data;
		}

		return {
			type: 'success',
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			data: result as any,
		};
	};
}

declare global {
	declare module 'express-serve-static-core' {
		// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
		interface Locals {
			// eslint-disable-next-line @typescript-eslint/consistent-type-imports
			readonly login: import('@lusc/initiatives-tracker-util/types.js').LoginInfo;
		}

		// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
		interface Request {
			search: URLSearchParams;
		}
	}
}

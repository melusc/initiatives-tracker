declare global {
	declare module 'express-serve-static-core' {
		// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
		interface Locals {
			readonly user: {
				readonly userId: string;
				readonly username: string;
				readonly isAdmin: boolean;
			};
		}

		// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
		interface Request {
			search: URLSearchParams;
		}
	}
}

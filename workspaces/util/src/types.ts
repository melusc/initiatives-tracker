export type Initiative = {
	id: string;
	shortName: string;
	fullName: string;
	website: string;
	pdfUrl: string;
	imageUrl: string;
	deadline: string;
};

export type EnrichedInitiative = Initiative & {
	signatures: User[];
	organisations: Organisation[];
};

export type Organisation = {
	id: string;
	name: string;
	image: string | null;
	homepage: string | null;
};

export type EnrichedOrganisation = Organisation & {
	signatures: Initiative[];
};

export type User = {
	name: string;
	id: string;
};

export type EnrichedUser = User & {
	initiatives: Initiative[];
};

export type ApiResponseError = {
	type: 'error';
	readableError: string;
	error: string;
};

export type ApiResponseSuccess<R> = {
	type: 'success';
	data: R;
};

export type ApiResponse<R> = ApiResponseError | ApiResponseSuccess<R>;

export type LoginInfo = {
	name: string;
	id: string;
	isAdmin: boolean;
	iconKey: string;
};

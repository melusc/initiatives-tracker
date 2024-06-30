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
	signatures: Person[];
	organisations: Organisation[];
};

export type Organisation = {
	id: string;
	name: string;
	imageUrl: string | null;
	website: string | null;
};

export type EnrichedOrganisation = Organisation & {
	signatures: Initiative[];
};

export type Person = {
	name: string;
	id: string;
};

export type EnrichedPerson = Person & {
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
};

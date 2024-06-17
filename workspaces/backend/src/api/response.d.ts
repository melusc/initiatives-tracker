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

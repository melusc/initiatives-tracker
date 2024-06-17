export class RelativeUrl {
	readonly #url: URL;

	constructor(base: string | URL | RelativeUrl) {
		this.#url
			= base instanceof RelativeUrl
				? new URL(base.full, 'http://localhost/')
				: new URL(base, 'http://localhost/');
	}

	get full(): string {
		const url = this.#url;

		return url.pathname + url.search + url.hash;
	}

	get path(): string {
		return this.#url.pathname;
	}

	set path(p: string) {
		this.#url.pathname = p;
	}

	get search(): string {
		return this.#url.search;
	}

	set search(s: string) {
		this.#url.search = s;
	}

	get searchParams(): URLSearchParams {
		return this.#url.searchParams;
	}

	get hash(): string {
		return this.#url.hash;
	}

	set hash(h: string) {
		this.#url.hash = h;
	}
}

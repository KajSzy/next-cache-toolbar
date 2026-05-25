/** Next.js extends `fetch` with cache options; apps pass these through when needed. */
export type GithubFetchInit = RequestInit & {
	next?: {
		tags?: string[];
		revalidate?: number | false;
	};
};

export type GithubSearchOptions = {
	perPage?: number;
	init?: GithubFetchInit;
};

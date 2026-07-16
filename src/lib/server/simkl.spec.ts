import { describe, it, expect } from 'vitest';
import { createSimklClient, SimklApiError, type DiscoverItem } from './simkl';

function makeFetchStub(
	expected: {
		url?: string;
		method?: string;
		headers?: Record<string, string>;
		body?: unknown;
	},
	response: { status?: number; statusText?: string; json?: unknown } = {}
) {
	return async (url: RequestInfo | URL, init?: RequestInit) => {
		if (expected.url) {
			expect(url.toString()).toBe(expected.url);
		}
		if (expected.method) {
			expect(init?.method).toBe(expected.method);
		}
		if (expected.headers) {
			const requestHeaders = init?.headers as Record<string, string>;
			for (const [key, value] of Object.entries(expected.headers)) {
				expect(requestHeaders[key]).toBe(value);
			}
		}
		if (expected.body !== undefined) {
			expect(JSON.parse(init?.body as string)).toEqual(expected.body);
		}

		return {
			ok: response.status === undefined || response.status < 400,
			status: response.status ?? 200,
			statusText: response.statusText ?? 'OK',
			json: async () => response.json
		} as Response;
	};
}

describe('createSimklClient', () => {
	const config = {
		clientId: 'test-client-id',
		accessToken: 'test-access-token',
		apiBase: 'https://api.test.example'
	};

	it('discover hits /movies/trending with both headers and no auth required', async () => {
		const fixture: DiscoverItem[] = [
			{
				title: 'Test Movie',
				poster: '54/5456742c5450c5ab4',
				overview: 'A test movie.',
				ids: { simkl_id: 12345 }
			}
		];

		const fetch = makeFetchStub(
			{
				url: 'https://api.test.example/movies/trending',
				method: 'GET',
				headers: {
					'simkl-api-key': 'test-client-id',
					Authorization: 'Bearer test-access-token'
				}
			},
			{ json: fixture }
		);

		const client = createSimklClient({ fetch, config });
		const result = await client.discover();

		expect(result).toEqual(fixture);
	});

	it('addToWatchlist posts to /sync/add-to-list with ids.simkl', async () => {
		const fetch = makeFetchStub(
			{
				url: 'https://api.test.example/sync/add-to-list',
				method: 'POST',
				headers: {
					'simkl-api-key': 'test-client-id',
					Authorization: 'Bearer test-access-token'
				},
				body: {
					movies: [{ to: 'plantowatch', ids: { simkl: 12345 } }]
				}
			},
			{ json: { added: { movies: 1 } } }
		);

		const client = createSimklClient({ fetch, config });
		const result = await client.addToWatchlist(12345);

		expect(result).toEqual({ added: { movies: 1 } });
	});

	it('addToHistory posts to /sync/history with ids.simkl', async () => {
		const fetch = makeFetchStub(
			{
				url: 'https://api.test.example/sync/history',
				method: 'POST',
				headers: {
					'simkl-api-key': 'test-client-id',
					Authorization: 'Bearer test-access-token'
				},
				body: {
					movies: [{ ids: { simkl: 67890 } }]
				}
			},
			{ json: { added: { movies: 1 } } }
		);

		const client = createSimklClient({ fetch, config });
		const result = await client.addToHistory(67890);

		expect(result).toEqual({ added: { movies: 1 } });
	});

	it('throws SimklApiError on non-OK discover response', async () => {
		const fetch = makeFetchStub(
			{ url: 'https://api.test.example/movies/trending', method: 'GET' },
			{ status: 429, statusText: 'Too Many Requests' }
		);

		const client = createSimklClient({ fetch, config });
		await expect(client.discover()).rejects.toThrow(SimklApiError);
	});
});

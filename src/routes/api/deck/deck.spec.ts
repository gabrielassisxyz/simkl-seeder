import { describe, it, expect } from 'vitest';
import { GET, type DeckItem } from './+server';
import type { RequestEvent } from './$types';
import { createSimklClient, type DiscoverItem } from '$lib/server/simkl';
import type { SimklConfig } from '$lib/server/env';

const testConfig: SimklConfig = {
	clientId: 'test-client-id',
	accessToken: 'test-access-token',
	apiBase: 'https://api.test.example'
};

function makeRequestEvent(client: ReturnType<typeof createSimklClient>): RequestEvent {
	return {
		locals: { simklClient: client },
		fetch: globalThis.fetch
	} as unknown as RequestEvent;
}

function makeClient() {
	return createSimklClient({
		fetch: async () => {
			throw new Error('this client should not call fetch in the route test');
		},
		config: testConfig
	});
}

describe('GET /api/deck', () => {
	it('returns normalized deck items and never exposes credentials', async () => {
		const rawItems: DiscoverItem[] = [
			{
				title: 'Fixture One',
				poster: '54/5456742c5450c5ab4',
				overview: 'First overview.',
				release_date: '2022-06-15',
				runtime: '2h 5m',
				ratings: { simkl: { rating: 8.1, votes: 100 }, imdb: { rating: 7.2, votes: 200 } },
				ids: { simkl_id: 123 }
			},
			{
				title: 'Fixture Two',
				ids: { simkl_id: 456 }
			}
		];

		const client = makeClient();
		const event = makeRequestEvent(client);

		// Stub discover directly on the client so no HTTP request is made.
		client.discover = async () => rawItems;

		const response = await GET(event);
		const body = (await response.json()) as DeckItem[];

		expect(response.status).toBe(200);
		expect(body).toEqual([
			{
				simklId: 123,
				title: 'Fixture One',
				poster: '54/5456742c5450c5ab4',
				overview: 'First overview.',
				year: 2022,
				runtime: 125,
				ratingSimkl: 8.1,
				ratingImdb: 7.2
			},
			{ simklId: 456, title: 'Fixture Two' }
		]);

		const text = JSON.stringify(body);
		expect(text).not.toContain('test-client-id');
		expect(text).not.toContain('test-access-token');
	});
});

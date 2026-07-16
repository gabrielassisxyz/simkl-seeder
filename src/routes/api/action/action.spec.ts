import { describe, it, expect } from 'vitest';
import { POST, type ActionResult } from './+server';
import type { RequestEvent } from './$types';
import { createSimklClient } from '$lib/server/simkl';
import type { SimklConfig } from '$lib/server/env';

const testConfig: SimklConfig = {
	clientId: 'test-client-id',
	accessToken: 'test-access-token',
	apiBase: 'https://api.test.example'
};

function makeClient() {
	return createSimklClient({
		fetch: async () => {
			throw new Error('this client should not call fetch in the route test');
		},
		config: testConfig
	});
}

function makeRequestEvent(client: ReturnType<typeof makeClient>, body: unknown): RequestEvent {
	return {
		locals: { simklClient: client },
		fetch: globalThis.fetch,
		request: new Request('http://localhost/api/action', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		})
	} as unknown as RequestEvent;
}

describe('POST /api/action', () => {
	it('routes watchlater to addToWatchlist', async () => {
		const client = makeClient();
		const calls: { method: string; id: number }[] = [];
		client.addToWatchlist = async (id) => {
			calls.push({ method: 'addToWatchlist', id });
			return { added: { movies: 1 } };
		};

		const response = await POST(makeRequestEvent(client, { simklId: 42, action: 'watchlater' }));
		const body = (await response.json()) as ActionResult;

		expect(response.status).toBe(200);
		expect(body).toEqual({ ok: true, action: 'watchlater' });
		expect(calls).toEqual([{ method: 'addToWatchlist', id: 42 }]);
	});

	it('routes watched to addToHistory', async () => {
		const client = makeClient();
		const calls: { method: string; id: number }[] = [];
		client.addToHistory = async (id) => {
			calls.push({ method: 'addToHistory', id });
			return { added: { movies: 1 } };
		};

		const response = await POST(makeRequestEvent(client, { simklId: 99, action: 'watched' }));
		const body = (await response.json()) as ActionResult;

		expect(response.status).toBe(200);
		expect(body).toEqual({ ok: true, action: 'watched' });
		expect(calls).toEqual([{ method: 'addToHistory', id: 99 }]);
	});

	it('returns 400 for unknown actions without writing to Simkl', async () => {
		const client = makeClient();
		let written = false;
		client.addToWatchlist = async () => {
			written = true;
			return {};
		};
		client.addToHistory = async () => {
			written = true;
			return {};
		};

		await expect(
			POST(makeRequestEvent(client, { simklId: 1, action: 'skip' }))
		).rejects.toMatchObject({ status: 400 });
		expect(written).toBe(false);
	});

	it('returns 400 for invalid simklId without writing to Simkl', async () => {
		const client = makeClient();
		let written = false;
		client.addToWatchlist = async () => {
			written = true;
			return {};
		};
		client.addToHistory = async () => {
			written = true;
			return {};
		};

		await expect(
			POST(makeRequestEvent(client, { simklId: 'not-a-number', action: 'watchlater' }))
		).rejects.toMatchObject({ status: 400 });
		expect(written).toBe(false);
	});
});

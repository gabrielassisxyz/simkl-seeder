import { json, error } from '@sveltejs/kit';
import { createSimklClient } from '$lib/server/simkl';
import { simklConfig } from '$lib/server/env';
import type { RequestEvent } from './$types';

export type ActionName = 'watchlater' | 'watched';

export interface ActionBody {
	simklId: number;
	action: ActionName | string;
}

export interface ActionResult {
	ok: true;
	action: ActionName;
}

export async function POST(event: RequestEvent): Promise<Response> {
	const client =
		event.locals.simklClient ?? createSimklClient({ fetch: event.fetch, config: simklConfig() });

	const body = (await event.request.json()) as ActionBody;
	const simklId = body.simklId;

	if (typeof simklId !== 'number') {
		error(400, 'Missing or invalid simklId');
	}

	const action = body.action;

	if (action === 'watchlater') {
		await client.addToWatchlist(simklId);
		return json({ ok: true, action: 'watchlater' } satisfies ActionResult);
	}

	if (action === 'watched') {
		await client.addToHistory(simklId);
		return json({ ok: true, action: 'watched' } satisfies ActionResult);
	}

	error(400, `Unknown action: ${action}`);
}

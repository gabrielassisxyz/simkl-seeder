import { json } from '@sveltejs/kit';
import { createSimklClient } from '$lib/server/simkl';
import { simklConfig } from '$lib/server/env';
import type { RequestEvent } from './$types';

export interface DeckItem {
	simklId: number;
	title: string;
	poster?: string;
	overview?: string;
}

export async function GET(event: RequestEvent): Promise<Response> {
	const client =
		event.locals.simklClient ?? createSimklClient({ fetch: event.fetch, config: simklConfig() });
	const discovered = await client.discover();

	const deck: DeckItem[] = discovered.map((item) => ({
		simklId: item.ids.simkl_id,
		title: item.title,
		poster: item.poster,
		overview: item.overview
	}));

	return json(deck);
}

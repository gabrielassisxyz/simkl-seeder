import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { createSimklClient } from '$lib/server/simkl';
import { simklConfig } from '$lib/server/env';
import type { RequestEvent } from './$types';

export interface DeckItem {
	simklId: number;
	title: string;
	poster?: string;
	overview?: string;
	year?: number;
	runtime?: number;
	ratingSimkl?: number;
	ratingImdb?: number;
}

function yearFromDate(date?: string): number | undefined {
	if (!date) return undefined;
	const year = Number(date.split('-')[0]);
	return Number.isFinite(year) ? year : undefined;
}

export async function GET(event: RequestEvent): Promise<Response> {
	// Use the platform's global `fetch`, NOT event.fetch: SvelteKit's event.fetch
	// injects `Origin` + `Sec-Fetch-Mode: cors` headers, and Simkl's trending
	// endpoint then returns a degraded payload with no title/overview. A plain
	// server-to-server fetch (no Origin) gets the full records back.
	const client = event.locals.simklClient ?? createSimklClient({ fetch, config: simklConfig(env) });
	const discovered = await client.discover();

	const deck: DeckItem[] = discovered.map((item) => ({
		simklId: item.ids.simkl_id,
		title: item.title,
		poster: item.poster,
		overview: item.overview,
		year: yearFromDate(item.release_date),
		runtime: item.runtime,
		ratingSimkl: item.ratings?.simkl,
		ratingImdb: item.ratings?.imdb
	}));

	return json(deck);
}

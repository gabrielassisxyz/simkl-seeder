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
	// Simkl sends US-format "MM/DD/YYYY"; tolerate ISO "YYYY-MM-DD" too. Grab the
	// first 4-digit run rather than assuming a separator.
	const match = date.match(/\d{4}/);
	const year = match ? Number(match[0]) : NaN;
	return Number.isFinite(year) ? year : undefined;
}

function runtimeToMinutes(runtime?: string): number | undefined {
	if (!runtime) return undefined;
	// Simkl sends a human string like "2h 41m" or "58m"; the UI wants minutes.
	const hours = runtime.match(/(\d+)\s*h/);
	const mins = runtime.match(/(\d+)\s*m/);
	const total = (hours ? Number(hours[1]) * 60 : 0) + (mins ? Number(mins[1]) : 0);
	return total > 0 ? total : undefined;
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
		runtime: runtimeToMinutes(item.runtime),
		ratingSimkl: item.ratings?.simkl?.rating,
		ratingImdb: item.ratings?.imdb?.rating
	}));

	return json(deck);
}

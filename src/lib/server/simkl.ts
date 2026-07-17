import { simklConfig, type SimklConfig } from './env';

// Simkl nests each provider's score under `{ rating, votes }`, and sends runtime
// as a human string like "2h 41m" — the raw shapes the mapping must normalise.
export interface SimklRatingValue {
	rating?: number;
	votes?: number;
}

export interface SimklRatings {
	imdb?: SimklRatingValue;
	simkl?: SimklRatingValue;
}

export interface DiscoverItem {
	title: string;
	poster?: string;
	overview?: string;
	release_date?: string;
	runtime?: string;
	ratings?: SimklRatings;
	ids: {
		simkl_id: number;
	};
}

export interface SimklClientOptions {
	fetch: typeof globalThis.fetch;
	config: SimklConfig;
}

export function createSimklClient({ fetch, config }: SimklClientOptions) {
	const headers = () => ({
		'simkl-api-key': config.clientId,
		Authorization: `Bearer ${config.accessToken}`,
		Accept: 'application/json',
		'Content-Type': 'application/json'
	});

	async function discover(): Promise<DiscoverItem[]> {
		const url = new URL('/movies/trending', config.apiBase).toString();
		const response = await fetch(url, {
			method: 'GET',
			headers: headers()
		});

		if (!response.ok) {
			throw new SimklApiError(`Discover failed: ${response.status} ${response.statusText}`);
		}

		return response.json();
	}

	async function addToWatchlist(simklId: number): Promise<unknown> {
		const url = new URL('/sync/add-to-list', config.apiBase).toString();
		const response = await fetch(url, {
			method: 'POST',
			headers: headers(),
			body: JSON.stringify({
				movies: [{ to: 'plantowatch', ids: { simkl: simklId } }]
			})
		});

		if (!response.ok) {
			throw new SimklApiError(`addToWatchlist failed: ${response.status} ${response.statusText}`);
		}

		return response.json();
	}

	async function addToHistory(simklId: number): Promise<unknown> {
		const url = new URL('/sync/history', config.apiBase).toString();
		const response = await fetch(url, {
			method: 'POST',
			headers: headers(),
			body: JSON.stringify({
				movies: [{ ids: { simkl: simklId } }]
			})
		});

		if (!response.ok) {
			throw new SimklApiError(`addToHistory failed: ${response.status} ${response.statusText}`);
		}

		return response.json();
	}

	return { discover, addToWatchlist, addToHistory };
}

export class SimklApiError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'SimklApiError';
	}
}

export function simklFromEnv(fetchImpl: typeof globalThis.fetch = fetch) {
	return createSimklClient({ fetch: fetchImpl, config: simklConfig() });
}

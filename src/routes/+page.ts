import type { DeckItem } from '$lib/deck.svelte';
import type { PageLoad } from './$types';

// One bulk fetch per deck load — the rate-limit-safe path (see findings.md).
export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('/api/deck');
	const deck = (await response.json()) as DeckItem[];
	return { deck };
};

<script lang="ts">
	import Card from '$lib/Card.svelte';
	import Swipeable from '$lib/Swipeable.svelte';
	import Hotkeys from '$lib/Hotkeys.svelte';
	import { createDeckState } from '$lib/deck.svelte';
	import type { SwipeAction } from '$lib/swipe';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// Seed the deck once from the single bulk fetch — `data` never changes after
	// load, so capturing its initial value here is deliberate.
	// svelte-ignore state_referenced_locally
	const deck = createDeckState(data.deck);
	let expanded = $state(false);

	async function handleAction(action: SwipeAction) {
		const item = deck.current;
		if (!item) return;

		// Right/up write to Simkl through our proxy; left/skip writes nothing.
		if (action === 'watchlater' || action === 'watched') {
			await fetch('/api/action', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ simklId: item.simklId, action })
			});
		}

		expanded = false;
		deck.advance();
	}

	function toggleSeeMore() {
		expanded = !expanded;
	}
</script>

<Hotkeys onAction={handleAction} onSeeMore={toggleSeeMore} />

<main class="deck">
	{#if deck.current}
		<Swipeable onAction={handleAction}>
			<Card item={deck.current} bind:expanded />
		</Swipeable>
		<div class="hint" aria-live="polite">
			<span class="hint-key">←</span> skip
			<span class="hint-key">→</span> watch later
			<span class="hint-key">↑</span> watched
			<span class="hint-key">Space</span> more
		</div>
	{:else}
		<div class="empty" data-testid="empty">
			<h1>You're all caught up.</h1>
			<p>No more titles in the deck right now.</p>
		</div>
	{/if}
</main>

<style>
	.deck {
		display: grid;
		place-items: center;
		align-content: center;
		min-height: 100%;
		padding: clamp(1rem, 5vw, 2.5rem);
		gap: 1.5rem;
		background: var(--ground);
	}

	.hint {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem 1.25rem;
		color: var(--text-muted);
		font-size: 0.85rem;
		font-weight: 500;
	}

	.hint-key {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.5rem;
		padding: 0.15rem 0.4rem;
		border: 1px solid var(--hairline);
		border-radius: var(--radius-sm);
		background: var(--surface);
		color: var(--text);
		font-size: 0.75rem;
		font-weight: 600;
	}

	.empty {
		text-align: center;
		color: var(--text-muted);
	}

	.empty h1 {
		margin: 0 0 0.5rem;
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 5vw, 2.25rem);
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--text);
	}

	.empty p {
		margin: 0;
		font-size: 1rem;
	}
</style>

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
	{:else}
		<p class="empty" data-testid="empty">No more titles — you're all caught up.</p>
	{/if}
</main>

<style>
	.deck {
		display: grid;
		place-items: center;
		min-height: 100dvh;
		padding: 1rem;
		background: #0d0d0d;
	}

	.empty {
		color: #aaa;
		font-size: 1.1rem;
	}
</style>

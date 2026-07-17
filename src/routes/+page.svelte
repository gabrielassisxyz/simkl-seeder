<script lang="ts">
	import Card from '$lib/Card.svelte';
	import Swipeable from '$lib/Swipeable.svelte';
	import Hotkeys from '$lib/Hotkeys.svelte';
	import DetailModal from '$lib/DetailModal.svelte';
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
	let modalOpen = $state(false);
	let swipeable = $state<Swipeable | null>(null);

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

		modalOpen = false;
		deck.advance();
	}

	function triggerAction(action: SwipeAction) {
		swipeable?.swipeBy(action);
	}

	function openModal() {
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
	}

	function toggleModal() {
		modalOpen = !modalOpen;
	}
</script>

<Hotkeys onAction={triggerAction} onSeeMore={toggleModal} />

<main class="deck">
	{#if deck.current}
		{@const current = deck.current}
		<div class="card-stage">
			<Swipeable bind:this={swipeable} onAction={handleAction}>
				{#snippet children(dragProgress)}
					<Card item={current} {dragProgress} onOpenModal={openModal} />
				{/snippet}
			</Swipeable>
		</div>

		<div class="actions" data-no-drag>
			<button
				class="action skip"
				type="button"
				aria-label="Skip"
				data-testid="skip-button"
				onclick={() => triggerAction('skip')}
			>
				<span class="icon" aria-hidden="true">✕</span>
			</button>

			<button
				class="action watchlater"
				type="button"
				aria-label="Watch later"
				data-testid="watchlater-button"
				onclick={() => triggerAction('watchlater')}
			>
				<span class="icon heart" aria-hidden="true">♥</span>
			</button>

			<button
				class="action watched"
				type="button"
				aria-label="Already watched"
				data-testid="watched-button"
				onclick={() => triggerAction('watched')}
			>
				<span class="icon star" aria-hidden="true">★</span>
			</button>
		</div>

		<div class="hint" aria-live="polite">
			<span class="hint-key">←</span> skip
			<span class="hint-key">→</span> watch later
			<span class="hint-key">↑</span> watched
			<span class="hint-key">Space</span> details
		</div>

		<DetailModal item={deck.current} open={modalOpen} onClose={closeModal} />
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

	.card-stage {
		width: min(100%, 22rem);
		aspect-ratio: 2 / 3;
		position: relative;
	}

	.actions {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.25rem;
		margin-top: 0.25rem;
	}

	.action {
		--size: 3.5rem;
		width: var(--size);
		height: var(--size);
		border-radius: 50%;
		border: 1px solid var(--hairline);
		background: var(--ground-elevated);
		color: var(--text-muted);
		cursor: pointer;
		display: grid;
		place-items: center;
		transition:
			transform 160ms ease-out,
			border-color 160ms ease-out,
			background 160ms ease-out,
			color 160ms ease-out;
	}

	.action:hover {
		background: var(--surface);
		color: var(--text);
	}

	.action:active {
		transform: scale(0.94);
	}

	.icon {
		font-size: 1.45rem;
		line-height: 1;
	}

	.skip:hover {
		border-color: var(--swipe-skip, var(--text-muted));
		color: var(--swipe-skip, var(--text-muted));
	}

	.watchlater:hover {
		border-color: var(--swipe-like, var(--accent));
		color: var(--swipe-like, var(--accent));
	}

	.watched:hover {
		border-color: var(--swipe-super, var(--accent));
		color: var(--swipe-super, var(--accent));
	}

	.heart {
		font-size: 1.3rem;
	}

	.star {
		font-size: 1.55rem;
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

	@media (prefers-reduced-motion: reduce) {
		.action {
			transition: none;
		}
	}
</style>

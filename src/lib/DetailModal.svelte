<script lang="ts">
	import type { DeckItem } from './deck.svelte';
	import { fly, fade } from 'svelte/transition';

	interface Props {
		item: DeckItem;
		open: boolean;
		onClose: () => void;
	}

	let { item, open, onClose }: Props = $props();

	function onBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) onClose();
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			onClose();
		}
	}

	function formatRuntime(minutes?: number): string | undefined {
		if (!minutes || minutes <= 0) return undefined;
		const h = Math.floor(minutes / 60);
		const m = minutes % 60;
		if (h === 0) return `${m}m`;
		return m === 0 ? `${h}h` : `${h}h ${m}m`;
	}

	function rating(value?: number): string | undefined {
		if (value == null || Number.isNaN(value)) return undefined;
		return value.toFixed(1);
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
	<div
		class="backdrop"
		data-testid="detail-backdrop"
		role="presentation"
		aria-hidden="true"
		onclick={onBackdropClick}
		transition:fade={{ duration: 180 }}
	></div>

	<div
		class="modal-root"
		role="dialog"
		aria-modal="true"
		aria-labelledby="detail-title"
		data-testid="detail-modal"
	>
		<div
			class="sheet"
			transition:fly={{ y: 24, duration: 220, opacity: 0, easing: (t) => 1 - Math.pow(1 - t, 3) }}
		>
			<button
				class="close"
				type="button"
				aria-label="Close details"
				data-testid="close-modal"
				onclick={onClose}>✕</button
			>

			<h2 id="detail-title">{item.title}</h2>

			{#if item.year || item.runtime}
				<div class="meta-line">
					{#if item.year}<span>{item.year}</span>{/if}
					{#if item.year && formatRuntime(item.runtime)}<span class="dot" aria-hidden="true">·</span
						>{/if}
					{#if formatRuntime(item.runtime)}<span>{formatRuntime(item.runtime)}</span>{/if}
				</div>
			{/if}

			{#if item.ratingSimkl != null || item.ratingImdb != null}
				<div class="ratings" data-testid="ratings">
					{#if item.ratingSimkl != null}
						<div class="rating">
							<span class="rating-label">Simkl</span>
							<span class="rating-value">{rating(item.ratingSimkl)}</span>
						</div>
					{/if}
					{#if item.ratingImdb != null}
						<div class="rating">
							<span class="rating-label">IMDb</span>
							<span class="rating-value">{rating(item.ratingImdb)}</span>
						</div>
					{/if}
				</div>
			{/if}

			{#if item.overview}
				<div class="overview" data-testid="overview">
					<p>{item.overview}</p>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.65);
		backdrop-filter: blur(2px);
		z-index: 50;
	}

	.modal-root {
		position: fixed;
		inset: 0;
		z-index: 51;
		display: grid;
		place-items: end center;
		padding: clamp(0.75rem, 4vw, 2rem);
		pointer-events: none;
	}

	.sheet {
		position: relative;
		width: min(100%, 32rem);
		max-height: 78vh;
		overflow-y: auto;
		background: var(--ground-elevated);
		border: 1px solid var(--hairline);
		border-radius: var(--radius-md);
		padding: clamp(1.25rem, 4vw, 2rem);
		color: var(--text);
		pointer-events: auto;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
	}

	.close {
		position: absolute;
		top: 0.85rem;
		right: 0.85rem;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 1px solid var(--hairline);
		background: var(--surface);
		color: var(--text-muted);
		font-size: 0.9rem;
		line-height: 1;
		cursor: pointer;
		display: grid;
		place-items: center;
		transition:
			transform 160ms ease-out,
			color 160ms ease-out,
			border-color 160ms ease-out;
	}

	.close:hover {
		color: var(--accent);
		border-color: var(--accent);
	}

	.close:active {
		transform: scale(0.97);
	}

	.sheet h2 {
		margin: 0 1.75rem 0.75rem 0;
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 5vw, 2rem);
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -0.02em;
	}

	.meta-line {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
		color: var(--text-muted);
		font-size: 0.95rem;
		font-weight: 500;
	}

	.dot {
		color: var(--text-subtle);
	}

	.ratings {
		display: flex;
		gap: 1.25rem;
		margin-bottom: 1.25rem;
	}

	.rating {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.rating-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-subtle);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.rating-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--accent);
		font-variant-numeric: tabular-nums;
	}

	.overview {
		margin-top: 0.25rem;
	}

	.overview p {
		margin: 0;
		font-size: 1rem;
		line-height: 1.55;
		color: var(--text-muted);
	}

	@media (prefers-reduced-motion: reduce) {
		.backdrop,
		.sheet {
			transition: none;
			animation: none;
		}
	}
</style>

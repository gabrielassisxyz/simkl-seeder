<script lang="ts">
	import type { DeckItem } from './deck.svelte';

	interface Props {
		item: DeckItem;
		expanded?: boolean;
	}

	// `expanded` is bindable so the page can also drive see-more from a hotkey,
	// while the in-card button keeps working on its own.
	let { item, expanded = $bindable(false) }: Props = $props();

	function posterUrl(poster?: string): string | undefined {
		if (!poster) return undefined;
		return `https://simkl.net/posters/${poster}_m.jpg`;
	}

	function toggle() {
		expanded = !expanded;
	}
</script>

<article class="card" data-testid="card">
	{#if item.poster}
		<img class="poster" src={posterUrl(item.poster)} alt="{item.title} poster" />
	{:else}
		<div class="poster-placeholder">No poster</div>
	{/if}
	<div class="title-bar">
		<h2>{item.title}</h2>
		<button
			class="see-more"
			type="button"
			aria-expanded={expanded}
			aria-label={expanded ? 'Hide description' : 'Show description'}
			data-testid="see-more"
			onclick={toggle}
		>
			{expanded ? 'Less' : 'More'}
		</button>
	</div>
	{#if expanded && item.overview}
		<div class="overview" data-testid="overview">
			<p>{item.overview}</p>
		</div>
	{/if}
</article>

<style>
	.card {
		position: relative;
		width: 100%;
		max-width: 22rem;
		aspect-ratio: 2 / 3;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--ground-elevated);
		border: 1px solid var(--hairline);
		box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
	}

	.poster,
	.poster-placeholder {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.poster-placeholder {
		display: grid;
		place-items: center;
		color: var(--text-muted);
		font-size: 0.95rem;
		background: var(--surface);
	}

	.title-bar {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 1.25rem;
		padding-bottom: 1rem;
		background: var(--ground-elevated);
		border-top: 1px solid var(--hairline);
		color: var(--text);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.title-bar h2 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.375rem;
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: -0.02em;
	}

	.see-more {
		align-self: flex-start;
		padding: 0.4rem 0.85rem;
		border: 1px solid var(--hairline);
		border-radius: var(--radius-sm);
		background: var(--surface);
		color: var(--text);
		font-family: var(--font-body);
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out;
	}

	.see-more:hover {
		background: var(--accent-soft);
		border-color: var(--accent);
		color: var(--accent);
	}

	.overview {
		position: absolute;
		inset: 0;
		z-index: 1;
		padding: 1.5rem;
		padding-top: 1.25rem;
		display: flex;
		align-items: flex-end;
		background: var(--ground-elevated);
		color: var(--text);
		overflow-y: auto;
		border-top: 1px solid var(--hairline);
		animation: fade-in 180ms ease-out;
	}

	.overview p {
		margin: 0;
		font-size: 1rem;
		line-height: 1.55;
		color: var(--text-muted);
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(0.25rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.overview {
			animation: none;
		}
	}
</style>

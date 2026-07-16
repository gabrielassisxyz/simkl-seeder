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
	</div>
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
		max-width: 24rem;
		aspect-ratio: 2 / 3;
		border-radius: 0.75rem;
		overflow: hidden;
		background: #1a1a1a;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
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
		color: #888;
	}

	.title-bar {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 1rem;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
		color: #fff;
	}

	.title-bar h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		line-height: 1.3;
	}

	.see-more {
		position: absolute;
		right: 0.75rem;
		bottom: 0.75rem;
		z-index: 2;
		padding: 0.35rem 0.7rem;
		border: none;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.15);
		color: #fff;
		font-size: 0.85rem;
		font-weight: 500;
		backdrop-filter: blur(4px);
		cursor: pointer;
	}

	.overview {
		position: absolute;
		inset: 0;
		z-index: 1;
		padding: 1.25rem;
		display: flex;
		align-items: flex-end;
		background: linear-gradient(transparent 10%, rgba(0, 0, 0, 0.92) 45%);
		color: #eee;
		overflow-y: auto;
	}

	.overview p {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.5;
	}
</style>

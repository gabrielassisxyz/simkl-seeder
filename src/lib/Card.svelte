<script lang="ts">
	import type { DeckItem } from './deck.svelte';

	interface Props {
		item: DeckItem;
	}

	let { item }: Props = $props();

	function posterUrl(poster?: string): string | undefined {
		if (!poster) return undefined;
		return `https://simkl.net/posters/${poster}_m.jpg`;
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
</style>

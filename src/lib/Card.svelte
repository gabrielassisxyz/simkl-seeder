<script lang="ts">
	import type { DeckItem } from './deck.svelte';

	interface Props {
		item: DeckItem;
		dragProgress?: number;
		onOpenModal?: () => void;
	}

	let { item, dragProgress = 0, onOpenModal }: Props = $props();

	function posterUrl(poster?: string): string | undefined {
		if (!poster) return undefined;
		return `https://simkl.net/posters/${poster}_m.jpg`;
	}

	function clamp(n: number, min: number, max: number): number {
		return Math.max(min, Math.min(max, n));
	}

	const hintOpacity = $derived(clamp(Math.abs(dragProgress) * 0.025, 0, 1));
	const hintScale = $derived(0.85 + clamp(Math.abs(dragProgress) * 0.002, 0, 0.25));
	const hintColor = $derived(
		dragProgress > 0 ? 'var(--swipe-like, var(--accent))' : 'var(--swipe-skip, var(--text-muted))'
	);
	const hintLabel = $derived(dragProgress > 0 ? 'LIKE' : 'SKIP');
	const hintIcon = $derived(dragProgress > 0 ? '♥' : '✕');

	function formatRuntime(minutes?: number): string | undefined {
		if (!minutes || minutes <= 0) return undefined;
		const h = Math.floor(minutes / 60);
		const m = minutes % 60;
		if (h === 0) return `${m}m`;
		return m === 0 ? `${h}h` : `${h}h ${m}m`;
	}

	function metaLine(item: DeckItem): string {
		const parts: string[] = [];
		if (item.year) parts.push(String(item.year));
		const runtime = formatRuntime(item.runtime);
		if (runtime) parts.push(runtime);
		return parts.join('  ·  ');
	}
</script>

<article class="card" data-testid="card">
	{#if item.poster}
		<img class="poster" src={posterUrl(item.poster)} alt="{item.title} poster" />
	{:else}
		<div class="poster-placeholder">No poster</div>
	{/if}

	<div
		class="drag-hint"
		style:opacity={hintOpacity}
		style:color={hintColor}
		style:transform="translate(-50%, -50%) scale({hintScale})"
	>
		<span class="hint-icon">{hintIcon}</span>
		<span class="hint-text">{hintLabel}</span>
	</div>

	<button
		class="title-bar"
		type="button"
		aria-label="Open details for {item.title}"
		data-testid="open-modal"
		data-no-drag
		onclick={onOpenModal}
	>
		<div class="title-row">
			<h2>{item.title}</h2>
			<span class="meta">{metaLine(item)}</span>
		</div>
		<span class="chevron" aria-hidden="true">▲</span>
	</button>
</article>

<style>
	.card {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--ground-elevated);
		border: 1px solid var(--hairline);
		box-shadow: var(--shadow-card);
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

	.drag-hint {
		position: absolute;
		top: 16%;
		left: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		pointer-events: none;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.55);
		border: 3px solid currentColor;
		border-radius: var(--radius-md);
		padding: 0.6rem 1.1rem;
		transform-origin: center;
		will-change: transform, opacity;
	}

	.hint-icon {
		font-size: 1.5rem;
		line-height: 1;
	}

	.hint-text {
		font-size: 0.85rem;
	}

	.title-bar {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		/* Tall top padding so the scrim gradient has room to fade the poster out
		   under the text — the title floats over the image, Tinder-style, instead
		   of sitting in an opaque bar that hard-cuts the poster. */
		padding: 3.75rem 1.25rem 1.15rem;
		border: none;
		background: linear-gradient(
			to top,
			rgba(23, 23, 26, 0.96) 0%,
			rgba(23, 23, 26, 0.82) 38%,
			rgba(23, 23, 26, 0) 100%
		);
		color: var(--text);
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 0.75rem;
		text-align: left;
		cursor: pointer;
	}

	.title-row {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		min-width: 0;
	}

	.title-bar h2 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.375rem;
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: -0.02em;
		/* Keeps the title legible where a bright poster reaches up into the
		   translucent top of the scrim. */
		text-shadow: 0 1px 8px rgba(0, 0, 0, 0.45);
	}

	.meta {
		font-size: 0.85rem;
		color: var(--text-muted);
		font-weight: 500;
	}

	.chevron {
		color: var(--text-subtle);
		font-size: 0.75rem;
		transition: transform 200ms ease-out;
		flex-shrink: 0;
	}

	.title-bar:hover .chevron,
	.title-bar:active .chevron {
		transform: translateY(-2px);
		color: var(--accent);
	}
</style>

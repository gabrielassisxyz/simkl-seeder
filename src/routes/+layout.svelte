<script lang="ts">
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="app">
	<header class="topbar">
		<a href={resolve('/')} class="logo">Simkl Seeder</a>
	</header>
	{@render children()}
</div>

<style>
	:global(:root) {
		--ground: #17171a;
		--ground-elevated: #1e1e22;
		--surface: #252529;
		--text: #f5f4f2;
		--text-muted: #9d9da4;
		--text-subtle: #6d6d75;
		--accent: #4f9d96;
		--accent-hover: #5dada6;
		--accent-soft: rgba(79, 157, 150, 0.12);
		--hairline: rgba(245, 244, 242, 0.1);
		--radius-sm: 0.375rem;
		--radius-md: 0.75rem;
		/* Depth from material + hairlines, not big shadows (per design taste) —
		   these are deliberately shallower than a generic card shadow. */
		--shadow-card: 0 10px 28px rgba(0, 0, 0, 0.26);
		--shadow-modal: 0 16px 44px rgba(0, 0, 0, 0.4);
		--font-display: 'Schibsted Grotesk', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
		--font-body: 'Schibsted Grotesk', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
	}

	:global(*),
	:global(*::before),
	:global(*::after) {
		box-sizing: border-box;
	}

	:global(html) {
		color-scheme: dark;
	}

	/* One keyboard-focus convention for every interactive element: a single
	   accent ring, shown only for keyboard users. */
	:global(:focus-visible) {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	:global(:focus:not(:focus-visible)) {
		outline: none;
	}

	:global(body) {
		margin: 0;
		font-family: var(--font-body);
		background: var(--ground);
		color: var(--text);
		-webkit-font-smoothing: antialiased;
	}

	.app {
		min-height: 100dvh;
		display: grid;
		grid-template-rows: auto 1fr;
	}

	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem clamp(1rem, 5vw, 2.5rem);
		border-bottom: 1px solid var(--hairline);
	}

	.logo {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--text);
		text-decoration: none;
	}

	.logo:hover {
		color: var(--accent);
	}
</style>

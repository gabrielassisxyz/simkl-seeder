<script lang="ts">
	import type { Snippet } from 'svelte';
	import { swipe, type SwipeAction } from './swipe';

	interface Props {
		children?: Snippet;
		onAction: (action: SwipeAction) => void;
	}

	let { children, onAction }: Props = $props();
</script>

<div class="swipeable" use:swipe={{ onAction }} data-testid="swipeable">
	{@render children?.()}
</div>

<style>
	.swipeable {
		width: 100%;
		height: 100%;
		touch-action: none;
		user-select: none;
	}
</style>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SwipeAction } from './swipe';

	interface Props {
		children?: Snippet<[dragProgress: number]>;
		onAction: (action: SwipeAction) => void;
	}

	let { children, onAction }: Props = $props();

	let node = $state<HTMLDivElement | null>(null);
	let dragging = $state(false);
	let startX = 0;
	let startY = 0;
	let x = $state(0);
	let y = $state(0);
	let pointerId: number | null = null;

	const SWIPE_THRESHOLD = 120;
	const SNAP_DURATION = 220;
	const FLING_DURATION = 220;
	const ROTATION_FACTOR = 0.045;

	function prefersReducedMotion(): boolean {
		if (typeof window === 'undefined') return false;
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	function resetStyles(duration = SNAP_DURATION) {
		if (!node) return;
		const reduce = prefersReducedMotion();
		if (reduce) {
			node.style.transition = 'none';
			node.style.transform = '';
			node.style.opacity = '';
			return;
		}
		node.style.transition = `transform ${duration}ms cubic-bezier(0.23, 1, 0.32, 1), opacity ${duration}ms ease-out`;
		node.style.transform = 'translate3d(0,0,0) rotate(0deg)';
		node.style.opacity = '1';
	}

	function flingOff(action: SwipeAction, finalX: number, finalY: number) {
		if (!node) return;
		const reduce = prefersReducedMotion();
		if (reduce) {
			node.style.transition = 'none';
			node.style.transform = '';
			node.style.opacity = '0';
			onAction(action);
			return;
		}

		node.style.transition = `transform ${FLING_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1), opacity ${FLING_DURATION}ms ease-out`;
		const angle = (finalX / Math.max(window.innerWidth, 1)) * 18;
		node.style.transform = `translate3d(${finalX}px, ${finalY}px, 0) rotate(${angle}deg)`;
		node.style.opacity = '0';

		setTimeout(() => {
			onAction(action);
		}, FLING_DURATION);
	}

	function resolveAction(): { action: SwipeAction; outX: number; outY: number } | null {
		const dx = x;
		const dy = y;
		const absX = Math.abs(dx);
		const absY = Math.abs(dy);

		if (Math.max(absX, absY) < SWIPE_THRESHOLD) {
			return null;
		}

		if (absX > absY) {
			const action: SwipeAction = dx > 0 ? 'watchlater' : 'skip';
			return { action, outX: dx * 3, outY: y };
		}

		if (dy < 0) {
			return { action: 'watched', outX: x, outY: dy * 3 };
		}

		return null;
	}

	function onPointerDown(event: PointerEvent) {
		if (event.button !== 0) return;
		if (pointerId !== null) return;
		const target = event.target as HTMLElement | null;
		if (target?.closest('[data-no-drag]')) return;

		pointerId = event.pointerId;
		dragging = true;
		startX = event.clientX;
		startY = event.clientY;
		x = 0;
		y = 0;

		if (node) {
			try {
				node.setPointerCapture(pointerId);
			} catch {
				// pointer capture may not be available in the test environment
			}
			node.style.transition = 'none';
			node.style.willChange = 'transform, opacity';
		}
	}

	function onPointerMove(event: PointerEvent) {
		if (!dragging || event.pointerId !== pointerId) return;
		x = event.clientX - startX;
		y = event.clientY - startY;

		if (!node) return;
		const rotation = x * ROTATION_FACTOR;
		const distance = Math.sqrt(x * x + y * y);
		const opacity = Math.max(0.55, 1 - distance / (window.innerWidth * 0.9));
		node.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
		node.style.opacity = String(opacity);
	}

	function onPointerUp(event: PointerEvent) {
		if (!dragging || event.pointerId !== pointerId) return;
		releasePointer();

		const resolved = resolveAction();
		if (resolved) {
			flingOff(resolved.action, resolved.outX, resolved.outY);
		} else {
			resetStyles();
		}
	}

	function onPointerCancel(event: PointerEvent) {
		if (!dragging || event.pointerId !== pointerId) return;
		releasePointer();
		resetStyles();
	}

	function releasePointer() {
		dragging = false;
		if (pointerId !== null && node) {
			try {
				node.releasePointerCapture(pointerId);
			} catch {
				// capture may already be lost
			}
		}
		pointerId = null;
		if (node) {
			node.style.willChange = 'auto';
		}
	}

	export function swipeBy(action: SwipeAction) {
		if (!node) return;
		const rect = node.getBoundingClientRect();
		let outX = 0;
		let outY = 0;
		if (action === 'skip') outX = -rect.width * 1.5;
		else if (action === 'watchlater') outX = rect.width * 1.5;
		else if (action === 'watched') outY = -rect.height * 1.5;
		flingOff(action, outX, outY);
	}
</script>

<div
	class="swipeable"
	data-testid="swipeable"
	role="application"
	aria-roledescription="draggable card"
	aria-label="Swipe to triage this title"
	bind:this={node}
	onpointerdown={onPointerDown}
	onpointermove={onPointerMove}
	onpointerup={onPointerUp}
	onpointercancel={onPointerCancel}
>
	{@render children?.(x)}
</div>

<style>
	.swipeable {
		width: 100%;
		height: 100%;
		touch-action: none;
		user-select: none;
	}
</style>

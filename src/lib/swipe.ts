export type SwipeAction = 'watchlater' | 'watched' | 'skip';

export interface SwipeOptions {
	threshold?: number;
	onAction: (action: SwipeAction) => void;
}

const DEFAULT_THRESHOLD = 80;

export function swipe(node: HTMLElement, options: SwipeOptions) {
	let startX = 0;
	let startY = 0;
	let tracking = false;

	function handleStart(event: TouchEvent) {
		const touch = event.touches[0];
		startX = touch.clientX;
		startY = touch.clientY;
		tracking = true;
	}

	function handleMove(event: TouchEvent) {
		if (!tracking) return;
		const touch = event.touches[0];
		const dx = touch.clientX - startX;
		const dy = touch.clientY - startY;
		if (Math.abs(dx) > Math.abs(dy)) {
			event.preventDefault();
		}
	}

	function handleEnd(event: TouchEvent) {
		if (!tracking) return;
		tracking = false;
		const touch = event.changedTouches[0];
		const dx = touch.clientX - startX;
		const dy = touch.clientY - startY;
		const threshold = options.threshold ?? DEFAULT_THRESHOLD;

		if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return;

		if (Math.abs(dx) > Math.abs(dy)) {
			options.onAction(dx > 0 ? 'watchlater' : 'skip');
		} else if (dy < 0) {
			options.onAction('watched');
		}
	}

	function handleCancel() {
		tracking = false;
	}

	node.addEventListener('touchstart', handleStart, { passive: true });
	node.addEventListener('touchmove', handleMove, { passive: false });
	node.addEventListener('touchend', handleEnd, { passive: true });
	node.addEventListener('touchcancel', handleCancel, { passive: true });

	return {
		update(next: SwipeOptions) {
			options = next;
		},
		destroy() {
			node.removeEventListener('touchstart', handleStart);
			node.removeEventListener('touchmove', handleMove);
			node.removeEventListener('touchend', handleEnd);
			node.removeEventListener('touchcancel', handleCancel);
		}
	};
}

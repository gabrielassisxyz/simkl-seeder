import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Swipeable from './Swipeable.svelte';

const ORIGIN = { x: 100, y: 100 };

function makeTouch(element: Element, clientX: number, clientY: number): Touch {
	return new Touch({ identifier: 1, target: element, clientX, clientY });
}

function swipe(element: Element, toX: number, toY: number) {
	const start = makeTouch(element, ORIGIN.x, ORIGIN.y);
	const end = makeTouch(element, toX, toY);
	element.dispatchEvent(
		new TouchEvent('touchstart', {
			bubbles: true,
			touches: [start],
			targetTouches: [start],
			changedTouches: [start]
		})
	);
	element.dispatchEvent(
		new TouchEvent('touchend', {
			bubbles: true,
			touches: [],
			targetTouches: [],
			changedTouches: [end]
		})
	);
}

describe('Swipeable.svelte', () => {
	it('calls watchlater on right swipe', async () => {
		const onAction = vi.fn();
		render(Swipeable, { onAction });
		const element = await page.getByTestId('swipeable').element();

		swipe(element, 200, 100);

		expect(onAction).toHaveBeenCalledTimes(1);
		expect(onAction).toHaveBeenCalledWith('watchlater');
	});

	it('calls skip on left swipe', async () => {
		const onAction = vi.fn();
		render(Swipeable, { onAction });
		const element = await page.getByTestId('swipeable').element();

		swipe(element, 0, 100);

		expect(onAction).toHaveBeenCalledTimes(1);
		expect(onAction).toHaveBeenCalledWith('skip');
	});

	it('calls watched on up swipe', async () => {
		const onAction = vi.fn();
		render(Swipeable, { onAction });
		const element = await page.getByTestId('swipeable').element();

		swipe(element, 100, 0);

		expect(onAction).toHaveBeenCalledTimes(1);
		expect(onAction).toHaveBeenCalledWith('watched');
	});

	it('ignores small movements', async () => {
		const onAction = vi.fn();
		render(Swipeable, { onAction });
		const element = await page.getByTestId('swipeable').element();

		swipe(element, 110, 100);

		expect(onAction).not.toHaveBeenCalled();
	});

	it('ignores downward swipes', async () => {
		const onAction = vi.fn();
		render(Swipeable, { onAction });
		const element = await page.getByTestId('swipeable').element();

		swipe(element, 100, 200);

		expect(onAction).not.toHaveBeenCalled();
	});
});

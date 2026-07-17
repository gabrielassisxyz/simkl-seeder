import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Swipeable from './Swipeable.svelte';

const ORIGIN = { x: 200, y: 300 };

function dispatchPointerEvent(
	element: Element,
	type: string,
	clientX: number,
	clientY: number,
	options: { pointerId?: number; isPrimary?: boolean; buttons?: number } = {}
) {
	const event = new PointerEvent(type, {
		bubbles: true,
		cancelable: true,
		pointerType: 'mouse',
		clientX,
		clientY,
		pointerId: options.pointerId ?? 1,
		isPrimary: options.isPrimary ?? true,
		button: 0,
		buttons: options.buttons ?? (type === 'pointerup' ? 0 : 1)
	});
	element.dispatchEvent(event);
}

function swipe(element: Element, toX: number, toY: number) {
	dispatchPointerEvent(element, 'pointerdown', ORIGIN.x, ORIGIN.y);
	dispatchPointerEvent(element, 'pointermove', toX, toY);
	dispatchPointerEvent(element, 'pointerup', toX, toY);
}

describe('Swipeable.svelte', () => {
	it('calls watchlater on right swipe', async () => {
		const onAction = vi.fn();
		render(Swipeable, { onAction });
		const element = await page.getByTestId('swipeable').element();

		swipe(element, ORIGIN.x + 140, ORIGIN.y);
		await vi.waitFor(() => expect(onAction).toHaveBeenCalledTimes(1));

		expect(onAction).toHaveBeenCalledWith('watchlater');
	});

	it('calls skip on left swipe', async () => {
		const onAction = vi.fn();
		render(Swipeable, { onAction });
		const element = await page.getByTestId('swipeable').element();

		swipe(element, ORIGIN.x - 140, ORIGIN.y);
		await vi.waitFor(() => expect(onAction).toHaveBeenCalledTimes(1));

		expect(onAction).toHaveBeenCalledWith('skip');
	});

	it('calls watched on up swipe', async () => {
		const onAction = vi.fn();
		render(Swipeable, { onAction });
		const element = await page.getByTestId('swipeable').element();

		swipe(element, ORIGIN.x, ORIGIN.y - 140);
		await vi.waitFor(() => expect(onAction).toHaveBeenCalledTimes(1));

		expect(onAction).toHaveBeenCalledWith('watched');
	});

	it('ignores small movements', async () => {
		const onAction = vi.fn();
		render(Swipeable, { onAction });
		const element = await page.getByTestId('swipeable').element();

		swipe(element, ORIGIN.x + 40, ORIGIN.y);
		await new Promise((r) => setTimeout(r, 120));

		expect(onAction).not.toHaveBeenCalled();
	});

	it('ignores downward swipes', async () => {
		const onAction = vi.fn();
		render(Swipeable, { onAction });
		const element = await page.getByTestId('swipeable').element();

		swipe(element, ORIGIN.x, ORIGIN.y + 140);
		await new Promise((r) => setTimeout(r, 120));

		expect(onAction).not.toHaveBeenCalled();
	});
});

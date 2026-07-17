import { page } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import type { DeckItem } from '$lib/deck.svelte';

const DECK: DeckItem[] = [
	{ simklId: 111, title: 'First Movie', overview: 'first overview' },
	{ simklId: 222, title: 'Second Movie', overview: 'second overview' }
];

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

function okResponse() {
	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('+page.svelte deck wiring', () => {
	it('right-swipe POSTs watchlater then advances to the next card', async () => {
		const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () =>
			okResponse()
		);
		vi.stubGlobal('fetch', fetchMock);
		render(Page, { data: { deck: DECK } });

		const swipeable = await page.getByTestId('swipeable').element();
		swipe(swipeable, ORIGIN.x + 140, ORIGIN.y);

		await vi.waitFor(() => {
			expect(fetchMock).toHaveBeenCalledTimes(1);
		});
		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe('/api/action');
		expect(JSON.parse(init?.body as string)).toEqual({
			simklId: 111,
			action: 'watchlater'
		});

		await expect.element(page.getByText('Second Movie')).toBeInTheDocument();
	});

	it('left-swipe advances without any network call', async () => {
		const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () =>
			okResponse()
		);
		vi.stubGlobal('fetch', fetchMock);
		render(Page, { data: { deck: DECK } });

		const swipeable = await page.getByTestId('swipeable').element();
		swipe(swipeable, ORIGIN.x - 140, ORIGIN.y);

		await expect.element(page.getByText('Second Movie')).toBeInTheDocument();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('shows the empty state once the deck is exhausted', async () => {
		const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () =>
			okResponse()
		);
		vi.stubGlobal('fetch', fetchMock);
		render(Page, { data: { deck: [DECK[0]] } });

		const swipeable = await page.getByTestId('swipeable').element();
		swipe(swipeable, ORIGIN.x - 140, ORIGIN.y);

		await expect.element(page.getByTestId('empty')).toBeInTheDocument();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('clicking the heart button posts watchlater and advances', async () => {
		const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () =>
			okResponse()
		);
		vi.stubGlobal('fetch', fetchMock);
		render(Page, { data: { deck: DECK } });

		const button = page.getByTestId('watchlater-button');
		await button.click();

		await vi.waitFor(() => {
			expect(fetchMock).toHaveBeenCalledTimes(1);
		});
		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe('/api/action');
		expect(JSON.parse(init?.body as string)).toEqual({
			simklId: 111,
			action: 'watchlater'
		});

		await expect.element(page.getByText('Second Movie')).toBeInTheDocument();
	});

	it('Space opens the detail modal', async () => {
		const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () =>
			okResponse()
		);
		vi.stubGlobal('fetch', fetchMock);
		render(Page, { data: { deck: DECK } });

		window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

		await expect.element(page.getByTestId('detail-modal')).toBeInTheDocument();
	});
});

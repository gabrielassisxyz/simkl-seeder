import { page } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import type { DeckItem } from '$lib/deck.svelte';

const DECK: DeckItem[] = [
	{ simklId: 111, title: 'First Movie', overview: 'first overview' },
	{ simklId: 222, title: 'Second Movie', overview: 'second overview' }
];

function makeTouch(element: Element, clientX: number, clientY: number): Touch {
	return new Touch({ identifier: 1, target: element, clientX, clientY });
}

function swipe(element: Element, toX: number, toY: number) {
	const start = makeTouch(element, 100, 100);
	const end = makeTouch(element, toX, toY);
	element.dispatchEvent(
		new TouchEvent('touchstart', { bubbles: true, touches: [start], changedTouches: [start] })
	);
	element.dispatchEvent(
		new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [end] })
	);
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
		swipe(swipeable, 300, 100);

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
		swipe(swipeable, -100, 100);

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
		swipe(swipeable, -100, 100);

		await expect.element(page.getByTestId('empty')).toBeInTheDocument();
		expect(fetchMock).not.toHaveBeenCalled();
	});
});

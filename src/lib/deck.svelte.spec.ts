import { describe, it, expect } from 'vitest';
import { createDeckState } from './deck.svelte';

const items = [
	{ simklId: 1, title: 'First', poster: 'poster1', overview: 'overview one' },
	{ simklId: 2, title: 'Second', poster: 'poster2', overview: 'overview two' },
	{ simklId: 3, title: 'Third' }
];

describe('createDeckState', () => {
	it('starts at the first item and is not empty', () => {
		const deck = createDeckState(items);

		expect(deck.current).toEqual(items[0]);
		expect(deck.empty).toBe(false);
	});

	it('advances to the next item', () => {
		const deck = createDeckState(items);

		deck.advance();

		expect(deck.current).toEqual(items[1]);
		expect(deck.empty).toBe(false);
	});

	it('returns null and empty after the last item', () => {
		const deck = createDeckState(items);

		deck.advance();
		deck.advance();
		deck.advance();

		expect(deck.current).toBeNull();
		expect(deck.empty).toBe(true);
	});

	it('stays empty when advancing past the end', () => {
		const deck = createDeckState(items);

		for (let i = 0; i < items.length + 3; i += 1) {
			deck.advance();
		}

		expect(deck.current).toBeNull();
		expect(deck.empty).toBe(true);
	});

	it('is empty for an empty queue', () => {
		const deck = createDeckState([]);

		expect(deck.current).toBeNull();
		expect(deck.empty).toBe(true);

		deck.advance();

		expect(deck.current).toBeNull();
		expect(deck.empty).toBe(true);
	});
});

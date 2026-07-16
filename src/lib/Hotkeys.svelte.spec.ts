import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Hotkeys from './Hotkeys.svelte';

function press(key: string) {
	window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('Hotkeys.svelte', () => {
	it('fires watchlater on ArrowRight', () => {
		const onAction = vi.fn();
		const onSeeMore = vi.fn();
		render(Hotkeys, { onAction, onSeeMore });

		press('ArrowRight');

		expect(onAction).toHaveBeenCalledTimes(1);
		expect(onAction).toHaveBeenCalledWith('watchlater');
		expect(onSeeMore).not.toHaveBeenCalled();
	});

	it('fires watched on ArrowUp', () => {
		const onAction = vi.fn();
		const onSeeMore = vi.fn();
		render(Hotkeys, { onAction, onSeeMore });

		press('ArrowUp');

		expect(onAction).toHaveBeenCalledTimes(1);
		expect(onAction).toHaveBeenCalledWith('watched');
	});

	it('fires skip on ArrowLeft', () => {
		const onAction = vi.fn();
		const onSeeMore = vi.fn();
		render(Hotkeys, { onAction, onSeeMore });

		press('ArrowLeft');

		expect(onAction).toHaveBeenCalledTimes(1);
		expect(onAction).toHaveBeenCalledWith('skip');
	});

	it('fires see-more on Space', () => {
		const onAction = vi.fn();
		const onSeeMore = vi.fn();
		render(Hotkeys, { onAction, onSeeMore });

		press(' ');

		expect(onSeeMore).toHaveBeenCalledTimes(1);
		expect(onAction).not.toHaveBeenCalled();
	});

	it('ignores unbound keys', () => {
		const onAction = vi.fn();
		const onSeeMore = vi.fn();
		render(Hotkeys, { onAction, onSeeMore });

		press('x');

		expect(onAction).not.toHaveBeenCalled();
		expect(onSeeMore).not.toHaveBeenCalled();
	});
});

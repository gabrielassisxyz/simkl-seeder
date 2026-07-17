import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Card from './Card.svelte';

const item = {
	simklId: 54114,
	title: 'Harry Potter and the Chamber of Secrets',
	poster: '54/5456742c5450c5ab4',
	overview: 'Cars fly, trees fight back...',
	year: 2002,
	runtime: 161,
	ratingSimkl: 8.4,
	ratingImdb: 7.4
};

describe('Card.svelte', () => {
	it('renders the title', async () => {
		render(Card, { item });

		await expect.element(page.getByRole('heading', { level: 2 })).toHaveTextContent(item.title);
	});

	it('renders the poster image when a poster is provided', async () => {
		render(Card, { item });

		const img = page.getByRole('img');
		await expect.element(img).toBeInTheDocument();
		await expect
			.element(img)
			.toHaveAttribute('src', 'https://simkl.net/posters/54/5456742c5450c5ab4_m.jpg');
	});

	it('renders a placeholder when no poster is provided', async () => {
		render(Card, { item: { simklId: 1, title: 'No Poster Movie' } });

		await expect.element(page.getByText('No poster', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByRole('img')).not.toBeInTheDocument();
	});

	it('opens the modal when the title bar is clicked', async () => {
		const onOpenModal = vi.fn();
		render(Card, { item, onOpenModal });

		const card = await page.getByTestId('card').element();
		card.style.width = '300px';
		card.style.height = '450px';
		card.style.position = 'relative';

		const button = page.getByTestId('open-modal');
		await button.click();
		await vi.waitFor(() => expect(onOpenModal).toHaveBeenCalledTimes(1));
	});

	it('shows year and runtime in the meta line', async () => {
		render(Card, { item });

		const card = await page.getByTestId('card').element();
		card.style.width = '300px';
		card.style.height = '450px';
		card.style.position = 'relative';

		await expect.element(page.getByTestId('open-modal')).toHaveTextContent('2002');
		await expect.element(page.getByTestId('open-modal')).toHaveTextContent('2h 41m');
	});
});

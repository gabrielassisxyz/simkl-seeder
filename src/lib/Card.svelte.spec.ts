import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Card from './Card.svelte';

const item = {
	simklId: 54114,
	title: 'Harry Potter and the Chamber of Secrets',
	poster: '54/5456742c5450c5ab4',
	overview: 'Cars fly, trees fight back...'
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

	it('toggles the overview on see-more click', async () => {
		render(Card, { item });

		const button = page.getByTestId('see-more');
		await expect.element(button).toHaveTextContent('More');
		await expect.element(page.getByTestId('overview')).not.toBeInTheDocument();

		await button.click();
		await expect.element(button).toHaveTextContent('Less');
		await expect.element(page.getByTestId('overview')).toHaveTextContent(item.overview);

		await button.click();
		await expect.element(button).toHaveTextContent('More');
		await expect.element(page.getByTestId('overview')).not.toBeInTheDocument();
	});
});

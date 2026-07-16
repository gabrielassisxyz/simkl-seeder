export interface DeckItem {
	simklId: number;
	title: string;
	poster?: string;
	overview?: string;
}

export interface DeckState {
	current: DeckItem | null;
	empty: boolean;
	advance(): void;
}

export function createDeckState(initialQueue: DeckItem[]): DeckState {
	let index = $state(0);
	const queue = initialQueue;

	const current = $derived(queue[index] ?? null);
	const empty = $derived(current === null);

	function advance() {
		if (index < queue.length) {
			index += 1;
		}
	}

	return {
		get current() {
			return current;
		},
		get empty() {
			return empty;
		},
		advance
	};
}

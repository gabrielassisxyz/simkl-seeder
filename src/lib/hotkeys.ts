import type { SwipeAction } from './swipe';

export type HotkeyIntent = SwipeAction | 'see-more';

export interface HotkeyOptions {
	onAction: (action: SwipeAction) => void;
	onSeeMore: () => void;
}

// Hardcoded default bindings — arrows mirror the swipe directions (right =
// watch-later, up = watched, left = skip), space toggles the description.
const BINDINGS: Record<string, HotkeyIntent> = {
	ArrowRight: 'watchlater',
	ArrowUp: 'watched',
	ArrowLeft: 'skip',
	' ': 'see-more'
};

// Returns true when the key was bound (and handled), false otherwise, so callers
// can decide whether the event was consumed.
export function handleHotkey(event: KeyboardEvent, options: HotkeyOptions): boolean {
	const intent = BINDINGS[event.key];
	if (!intent) return false;

	event.preventDefault();
	if (intent === 'see-more') {
		options.onSeeMore();
	} else {
		options.onAction(intent);
	}
	return true;
}

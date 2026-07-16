<script lang="ts">
	import { handleHotkey, type HotkeyOptions } from './hotkeys';

	type Props = HotkeyOptions;

	let { onAction, onSeeMore }: Props = $props();

	function onKeydown(event: KeyboardEvent) {
		handleHotkey(event, { onAction, onSeeMore });
	}
</script>

<svelte:window onkeydown={onKeydown} />

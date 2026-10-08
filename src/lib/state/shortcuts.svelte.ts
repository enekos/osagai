import { hasModifier, matchKeys, parseKeys } from '../utils/keys.js';

export type ShortcutMap = Record<string, (e: KeyboardEvent) => unknown>;

export interface ShortcutOptions {
	enabled?: () => boolean;
}

const BUSY = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="dialog"], [role="menu"], [role="listbox"]';

export function keyboardBusy(target: EventTarget | null): boolean {
	return target instanceof Element && !!target.closest(BUSY);
}

export function shortcuts(map: ShortcutMap, options: ShortcutOptions = {}): void {
	const bindings = Object.entries(map).map(([spec, run]) => ({ combo: parseKeys(spec), run }));

	function onkey(e: KeyboardEvent) {
		if (e.defaultPrevented || e.isComposing) return;
		for (const { combo, run } of bindings) {
			if (!matchKeys(e, combo)) continue;
			if (!hasModifier(combo) && keyboardBusy(e.target)) return;
			if (run(e) !== false) e.preventDefault();
			return;
		}
	}

	$effect(() => {
		if (options.enabled && !options.enabled()) return;
		window.addEventListener('keydown', onkey);
		return () => window.removeEventListener('keydown', onkey);
	});
}

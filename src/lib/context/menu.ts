import { getContext, setContext } from 'svelte';

const KEY = Symbol('osagai.menu');

export function setMenu(close: () => void): void {
	setContext(KEY, close);
}

export function getMenuClose(): (() => void) | undefined {
	return getContext<(() => void) | undefined>(KEY);
}

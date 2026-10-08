export interface Combo {
	key: string;
	mod: boolean;
	ctrl: boolean;
	meta: boolean;
	alt: boolean;
	shift: boolean;
}

const ALIASES: Record<string, string> = {
	esc: 'escape',
	space: ' ',
	up: 'arrowup',
	down: 'arrowdown',
	left: 'arrowleft',
	right: 'arrowright',
	del: 'delete',
	return: 'enter',
	plus: '+'
};

const MAC_GLYPHS: Record<string, string> = { mod: '⌘', meta: '⌘', ctrl: '⌃', alt: '⌥', shift: '⇧' };
const PC_NAMES: Record<string, string> = { mod: 'Ctrl', meta: 'Win', ctrl: 'Ctrl', alt: 'Alt', shift: 'Shift' };
const KEY_NAMES: Record<string, string> = {
	escape: 'Esc',
	enter: '↵',
	' ': 'Space',
	arrowup: '↑',
	arrowdown: '↓',
	arrowleft: '←',
	arrowright: '→',
	backspace: '⌫',
	delete: 'Del',
	tab: 'Tab'
};

export function isMac(): boolean {
	if (typeof navigator === 'undefined') return false;
	return /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);
}

export function parseKeys(spec: string): Combo {
	const parts = spec.trim().toLowerCase().split('+');
	const last = parts.pop() ?? '';
	const has = (m: string) => parts.includes(m);
	return { key: ALIASES[last] ?? last, mod: has('mod'), ctrl: has('ctrl'), meta: has('meta') || has('cmd'), alt: has('alt') || has('option'), shift: has('shift') };
}

export function hasModifier(c: Combo): boolean {
	return c.mod || c.ctrl || c.meta || c.alt;
}

export function matchKeys(e: KeyboardEvent, combo: Combo | string, mac = isMac()): boolean {
	const c = typeof combo === 'string' ? parseKeys(combo) : combo;
	if (e.metaKey !== (c.meta || (c.mod && mac))) return false;
	if (e.ctrlKey !== (c.ctrl || (c.mod && !mac))) return false;
	if (e.altKey !== c.alt) return false;
	const symbol = c.key.length === 1 && !/[a-z0-9]/.test(c.key);
	if (!symbol && e.shiftKey !== c.shift) return false;
	if (e.key.toLowerCase() === c.key) return true;
	if (/^[a-z]$/.test(c.key)) return e.code === `Key${c.key.toUpperCase()}`;
	if (/^[0-9]$/.test(c.key)) return e.code === `Digit${c.key}`;
	return false;
}

export function formatKeys(spec: string, mac = isMac()): string {
	const c = parseKeys(spec);
	const mods = (['ctrl', 'alt', 'shift', 'meta', 'mod'] as const).filter((m) => c[m]);
	const key = KEY_NAMES[c.key] ?? c.key.toUpperCase();
	return mac ? mods.map((m) => MAC_GLYPHS[m]).join('') + key : [...mods.map((m) => PC_NAMES[m]), key].join('+');
}

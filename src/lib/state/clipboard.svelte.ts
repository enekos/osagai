import { toast } from './toast.svelte.js';

export interface CopyOptions {
	toast?: string | false;
}

const state = $state<{ last: string | null }>({ last: null });
let timer: ReturnType<typeof setTimeout> | undefined;

function viaSelection(text: string): boolean {
	const area = document.createElement('textarea');
	area.value = text;
	area.setAttribute('readonly', '');
	area.style.cssText = 'position: fixed; top: 0; left: 0; opacity: 0;';
	document.body.appendChild(area);
	area.select();
	try {
		return document.execCommand('copy');
	} catch {
		return false;
	} finally {
		area.remove();
	}
}

export async function copy(text: string, options: CopyOptions = {}): Promise<boolean> {
	try {
		if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
		await navigator.clipboard.writeText(text);
	} catch (e) {
		if (!viaSelection(text)) {
			toast.error(e);
			return false;
		}
	}
	state.last = text;
	clearTimeout(timer);
	timer = setTimeout(() => (state.last = null), 1500);
	const message = options.toast ?? 'Copied';
	if (message) toast.ok(message);
	return true;
}

export function copied(text?: string): boolean {
	return state.last !== null && (text === undefined || state.last === text);
}

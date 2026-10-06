import type { Action } from 'svelte/action';
import { tooltipId, tooltips } from '../state/tooltip.svelte.js';
import type { Side } from '../utils/position.js';

export interface TooltipOptions {
	text: string | null | undefined | false;
	side?: Side;
	delay?: number;
}

export type TooltipInput = TooltipOptions | string | null | undefined | false;

function normalize(input: TooltipInput): Required<TooltipOptions> {
	const o = typeof input === 'object' && input !== null ? input : { text: input };
	return { text: o.text || '', side: o.side ?? 'top', delay: o.delay ?? 350 };
}

function keyboardFocused(node: HTMLElement): boolean {
	try {
		return node.matches(':focus-visible');
	} catch {
		return true;
	}
}

export const tooltip: Action<HTMLElement, TooltipInput> = (node, initial) => {
	let opts = normalize(initial);
	let timer: ReturnType<typeof setTimeout> | undefined;
	let id: number | null = null;
	let describedBefore: string | null = null;

	function show() {
		timer = undefined;
		if (!opts.text || id !== null) return;
		id = tooltips.show(opts.text, node, opts.side);
		if (node.getAttribute('aria-label') !== opts.text) {
			describedBefore = node.getAttribute('aria-describedby');
			node.setAttribute('aria-describedby', [describedBefore, tooltipId(id)].filter(Boolean).join(' '));
		}
		document.addEventListener('keydown', onkey, true);
	}
	function hide() {
		clearTimeout(timer);
		timer = undefined;
		if (id === null) return;
		tooltips.hide(id);
		id = null;
		if (describedBefore) node.setAttribute('aria-describedby', describedBefore);
		else node.removeAttribute('aria-describedby');
		describedBefore = null;
		document.removeEventListener('keydown', onkey, true);
	}
	function schedule(delay: number) {
		if (!opts.text || id !== null) return;
		clearTimeout(timer);
		timer = setTimeout(show, delay);
	}
	function onenter(e: PointerEvent) {
		if (e.pointerType === 'touch') return;
		schedule(opts.delay);
	}
	function onfocus() {
		if (keyboardFocused(node)) schedule(Math.min(opts.delay, 150));
	}
	function onkey(e: KeyboardEvent) {
		if (e.key === 'Escape') hide();
	}

	node.addEventListener('pointerenter', onenter);
	node.addEventListener('pointerleave', hide);
	node.addEventListener('pointerdown', hide);
	node.addEventListener('focusin', onfocus);
	node.addEventListener('focusout', hide);

	return {
		update(next) {
			opts = normalize(next);
			if (id === null) return;
			if (opts.text) tooltips.update(id, opts.text);
			else hide();
		},
		destroy() {
			hide();
			node.removeEventListener('pointerenter', onenter);
			node.removeEventListener('pointerleave', hide);
			node.removeEventListener('pointerdown', hide);
			node.removeEventListener('focusin', onfocus);
			node.removeEventListener('focusout', hide);
		}
	};
};

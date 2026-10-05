import type { Action } from 'svelte/action';
import { placeBox, type Box, type PlaceOptions, type Placement } from '../utils/position.js';

export type AnchorTarget = HTMLElement | Box | { x: number; y: number };

export interface AnchorOptions extends PlaceOptions {
	to: AnchorTarget | null | undefined;
	matchWidth?: boolean;
	onoutside?: (e: PointerEvent) => void;
	onplace?: (p: Placement) => void;
}

function boxOf(to: AnchorTarget): Box {
	if (to instanceof HTMLElement) return to.getBoundingClientRect();
	if ('width' in to) return to;
	return { left: to.x, top: to.y, width: 0, height: 0 };
}

export const anchor: Action<HTMLElement, AnchorOptions> = (node, initial) => {
	let opts = initial;
	let frame = 0;
	node.style.position = 'fixed';

	function place() {
		frame = 0;
		if (!opts.to) return;
		const box = boxOf(opts.to);
		node.style.setProperty('--o-anchor-width', `${box.width}px`);
		if (opts.matchWidth) node.style.minWidth = `${box.width}px`;
		node.style.removeProperty('--o-anchor-room');
		const own = node.getBoundingClientRect();
		const p = placeBox(box, own, { width: window.innerWidth, height: window.innerHeight }, opts);
		node.style.left = `${p.left}px`;
		node.style.top = `${p.top}px`;
		node.style.setProperty('--o-anchor-room', `${p.room}px`);
		node.dataset.side = p.side;
		opts.onplace?.(p);
	}
	function schedule() {
		if (!frame) frame = requestAnimationFrame(place);
	}
	function outside(e: PointerEvent) {
		const t = e.target as Node;
		if (node.contains(t) || (opts.to instanceof HTMLElement && opts.to.contains(t))) return;
		opts.onoutside?.(e);
	}

	place();
	window.addEventListener('scroll', schedule, true);
	window.addEventListener('resize', schedule);
	document.addEventListener('pointerdown', outside, true);
	const resized = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(schedule);
	resized?.observe(node);

	return {
		update(next) {
			opts = next;
			place();
		},
		destroy() {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener('scroll', schedule, true);
			window.removeEventListener('resize', schedule);
			document.removeEventListener('pointerdown', outside, true);
			resized?.disconnect();
		}
	};
};

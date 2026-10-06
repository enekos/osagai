import type { Side } from '../utils/position.js';

export interface TooltipItem {
	id: number;
	text: string;
	to: HTMLElement;
	side: Side;
}

class Tooltips {
	current = $state.raw<TooltipItem | null>(null);
	#seq = 0;

	show(text: string, to: HTMLElement, side: Side = 'top'): number {
		const id = ++this.#seq;
		this.current = { id, text, to, side };
		return id;
	}

	update(id: number, text: string): void {
		if (this.current?.id === id) this.current = { ...this.current, text };
	}

	hide(id: number): void {
		if (this.current?.id === id) this.current = null;
	}

	clear(): void {
		this.current = null;
	}
}

export const tooltips = new Tooltips();

export function tooltipId(id: number): string {
	return `o-tip-${id}`;
}

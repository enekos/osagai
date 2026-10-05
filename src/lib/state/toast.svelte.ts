import { errorMessage } from '../utils/errors.js';

export type ToastKind = 'ok' | 'error' | 'info';

export interface ToastItem {
	id: number;
	kind: ToastKind;
	text: string;
}

class Toaster {
	items = $state<ToastItem[]>([]);
	#seq = 0;

	push(kind: ToastKind, text: string, ms = kind === 'error' ? 6000 : 3500): number {
		const id = ++this.#seq;
		this.items = [...this.items, { id, kind, text }];
		if (ms > 0) setTimeout(() => this.dismiss(id), ms);
		return id;
	}

	ok(text: string): number {
		return this.push('ok', text);
	}

	error(e: unknown): number {
		return this.push('error', errorMessage(e));
	}

	info(text: string): number {
		return this.push('info', text);
	}

	dismiss(id: number): void {
		this.items = this.items.filter((t) => t.id !== id);
	}

	clear(): void {
		this.items = [];
	}
}

export const toast = new Toaster();

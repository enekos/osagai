import { errorMessage } from '../utils/errors.js';

export type ToastKind = 'ok' | 'error' | 'info';

export interface ToastAction {
	label: string;
	run: () => unknown;
}

export interface ToastOptions {
	action?: ToastAction;
	ms?: number;
}

export interface ToastItem {
	id: number;
	kind: ToastKind;
	text: string;
	action?: ToastAction;
}

class Toaster {
	items = $state<ToastItem[]>([]);
	#seq = 0;
	readonly #timers = new Map<number, ReturnType<typeof setTimeout>>();

	push(kind: ToastKind, text: string, options: ToastOptions | number = {}): number {
		// Toasts with an action persist by default (WCAG 2.2.1): users must be able to reach the action.
		const { action, ms = action ? 0 : kind === 'error' ? 6000 : 3500 } = typeof options === 'number' ? { ms: options } : options;
		const id = ++this.#seq;
		this.items = [...this.items, action ? { id, kind, text, action } : { id, kind, text }];
		if (ms > 0) this.#timers.set(id, setTimeout(() => this.dismiss(id), ms));
		return id;
	}

	ok(text: string, options?: ToastOptions): number {
		return this.push('ok', text, options);
	}

	error(e: unknown, options?: ToastOptions): number {
		return this.push('error', errorMessage(e), options);
	}

	info(text: string, options?: ToastOptions): number {
		return this.push('info', text, options);
	}

	act(id: number): void {
		const action = this.items.find((t) => t.id === id)?.action;
		this.dismiss(id);
		if (!action) return;
		try {
			Promise.resolve(action.run()).catch((e: unknown) => this.error(e));
		} catch (e) {
			this.error(e);
		}
	}

	dismiss(id: number): void {
		clearTimeout(this.#timers.get(id));
		this.#timers.delete(id);
		this.items = this.items.filter((t) => t.id !== id);
	}

	clear(): void {
		for (const timer of this.#timers.values()) clearTimeout(timer);
		this.#timers.clear();
		this.items = [];
	}
}

export const toast = new Toaster();

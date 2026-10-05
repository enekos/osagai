import { errorMessage } from '../utils/errors.js';

export interface ConfirmOptions {
	title?: string;
	message?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	danger?: boolean;
	typeToConfirm?: string;
	action?: () => unknown | Promise<unknown>;
}

export interface PromptOptions {
	title: string;
	label?: string;
	value?: string;
	placeholder?: string;
	confirmLabel?: string;
	hint?: string;
	required?: boolean;
}

export type Request =
	| { kind: 'confirm'; options: ConfirmOptions; resolve: (ok: boolean) => void }
	| { kind: 'prompt'; options: PromptOptions; resolve: (value: string | null) => void };

class Dialogs {
	current = $state<Request | null>(null);
	busy = $state(false);
	error = $state<string | null>(null);
	#queue: Request[] = [];

	#enqueue(r: Request) {
		if (this.current) this.#queue.push(r);
		else this.#show(r);
	}

	#show(r: Request) {
		this.current = r;
		this.busy = false;
		this.error = null;
	}

	#next() {
		const r = this.#queue.shift();
		this.current = null;
		if (r) queueMicrotask(() => this.#show(r));
	}

	confirm(options: ConfirmOptions | string): Promise<boolean> {
		const o = typeof options === 'string' ? { title: options } : options;
		return new Promise((resolve) => this.#enqueue({ kind: 'confirm', options: o, resolve }));
	}

	prompt(options: PromptOptions | string): Promise<string | null> {
		const o = typeof options === 'string' ? { title: options } : options;
		return new Promise((resolve) => this.#enqueue({ kind: 'prompt', options: o, resolve }));
	}

	async accept(value?: string): Promise<void> {
		const r = this.current;
		if (!r || this.busy) return;
		if (r.kind === 'prompt') {
			r.resolve(value ?? '');
			this.#next();
			return;
		}
		if (r.options.action) {
			this.busy = true;
			this.error = null;
			try {
				await r.options.action();
			} catch (e) {
				this.error = errorMessage(e);
				this.busy = false;
				return;
			}
		}
		r.resolve(true);
		this.#next();
	}

	dismiss(): void {
		const r = this.current;
		if (!r || this.busy) return;
		if (r.kind === 'prompt') r.resolve(null);
		else r.resolve(false);
		this.#next();
	}
}

export const dialogs = new Dialogs();

export const confirm = (options: ConfirmOptions | string): Promise<boolean> => dialogs.confirm(options);
export const prompt = (options: PromptOptions | string): Promise<string | null> => dialogs.prompt(options);

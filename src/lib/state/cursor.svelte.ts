export interface CursorOptions {
	loop?: boolean;
	homeEnd?: boolean;
}

export class ListCursor {
	active = $state(0);
	#count: () => number;
	#opts: CursorOptions;

	constructor(count: () => number, opts: CursorOptions = {}) {
		this.#count = count;
		this.#opts = opts;
	}

	get index(): number {
		const n = this.#count();
		return n ? Math.min(this.active, n - 1) : -1;
	}

	to(i: number) {
		const n = this.#count();
		this.active = n ? Math.max(0, Math.min(i, n - 1)) : 0;
	}

	move(by: number) {
		const n = this.#count();
		if (!n) return;
		const at = Math.max(0, this.index);
		this.active = this.#opts.loop ? (at + by + n) % n : Math.max(0, Math.min(at + by, n - 1));
	}

	keydown(e: KeyboardEvent, pick: (i: number) => void): boolean {
		const homeEnd = this.#opts.homeEnd;
		if (e.key === 'ArrowDown') this.move(1);
		else if (e.key === 'ArrowUp') this.move(-1);
		else if (homeEnd && e.key === 'Home') this.to(0);
		else if (homeEnd && e.key === 'End') this.to(this.#count() - 1);
		else if (e.key === 'Enter' && this.index >= 0) pick(this.index);
		else return false;
		e.preventDefault();
		return true;
	}
}

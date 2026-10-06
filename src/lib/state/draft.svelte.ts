import { untrack } from 'svelte';

export interface DraftOptions<T> {
	equal?: (a: T, b: T) => boolean;
	guard?: boolean;
}

export interface Draft<T> {
	readonly dirty: boolean;
	readonly saved: T;
	commit(): void;
	snapshot(): T;
}

function same(a: unknown, b: unknown): boolean {
	return JSON.stringify(a) === JSON.stringify(b);
}

export function draft<T>(get: () => T, options: DraftOptions<T> = {}): Draft<T> {
	const equal = options.equal ?? same;
	const snapshot = () => $state.snapshot(get()) as T;
	let saved = $state.raw<T>(untrack(snapshot));
	const dirty = $derived(!equal(snapshot(), saved));

	if (options.guard !== false && typeof window !== 'undefined') {
		$effect(() => {
			if (!dirty) return;
			const warn = (e: BeforeUnloadEvent) => e.preventDefault();
			window.addEventListener('beforeunload', warn);
			return () => window.removeEventListener('beforeunload', warn);
		});
	}

	return {
		get dirty() {
			return dirty;
		},
		get saved() {
			return saved;
		},
		commit() {
			saved = snapshot();
		},
		snapshot
	};
}

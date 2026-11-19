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

export function draft<T>(get: () => T, options: DraftOptions<T> = {}): Draft<T> {
	const custom = options.equal;
	const snapshot = (): T => $state.snapshot(get()) as T;
	let saved = $state.raw<T>(untrack(snapshot));
	// With the default equality, serialize the saved value once at commit time so
	// `dirty` only stringifies the live value (one pass per read, not two).
	let savedJson = $state(custom ? '' : JSON.stringify(saved));
	const dirty = $derived.by(() => {
		const current = snapshot();
		return custom ? !custom(current, saved) : JSON.stringify(current) !== savedJson;
	});

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
			if (!custom) savedJson = JSON.stringify(saved);
		},
		snapshot
	};
}

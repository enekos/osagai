import { untrack } from 'svelte';
import { toast } from './toast.svelte.js';

export interface QueryOptions {
	every?: number;
	enabled?: () => boolean;
	toastErrors?: boolean;
}

export interface Query<T> {
	readonly data: T | undefined;
	readonly pending: boolean;
	readonly loaded: boolean;
	readonly error: unknown;
	reload(): Promise<T | undefined>;
	set(value: T): void;
}

export function query<T>(fn: () => Promise<T> | T, options: QueryOptions = {}): Query<T> {
	let data = $state<T | undefined>(undefined);
	let pending = $state(0);
	let loaded = $state(false);
	let error = $state<unknown>(null);
	let version = 0;
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function run(load: () => Promise<T> | T): Promise<T | undefined> {
		const v = ++version;
		clearTimeout(timer);
		pending++;
		try {
			const result = await load();
			if (v !== version) return undefined;
			data = result;
			error = null;
			loaded = true;
			return result;
		} catch (e) {
			if (v !== version) return undefined;
			error = e;
			if (options.toastErrors) toast.error(e);
			return undefined;
		} finally {
			pending--;
			if (v === version) schedule();
		}
	}

	function schedule() {
		clearTimeout(timer);
		if (!options.every) return;
		timer = setTimeout(() => {
			if (typeof document !== 'undefined' && document.hidden) schedule();
			else run(() => untrack(fn));
		}, options.every);
	}

	$effect(() => {
		if (options.enabled && !options.enabled()) {
			version++;
			clearTimeout(timer);
			return;
		}
		let p: Promise<T> | T;
		try {
			p = fn();
		} catch (e) {
			p = Promise.reject(e);
		}
		untrack(() => run(() => p));
		return () => {
			version++;
			clearTimeout(timer);
		};
	});

	return {
		get data() {
			return data;
		},
		get pending() {
			return pending > 0;
		},
		get loaded() {
			return loaded;
		},
		get error() {
			return error;
		},
		reload: () => run(() => untrack(fn)),
		set: (value: T) => {
			data = value;
			loaded = true;
		}
	};
}

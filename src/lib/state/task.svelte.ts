import { toast } from './toast.svelte.js';

export interface TaskOptions<R> {
	success?: string | ((result: R) => string | undefined);
	toastErrors?: boolean;
	onerror?: (e: unknown) => void;
}

export interface Task<A extends unknown[], R> {
	(...args: A): Promise<R | undefined>;
	readonly pending: boolean;
	readonly error: unknown;
}

export function task<A extends unknown[], R>(fn: (...args: A) => Promise<R> | R, options: TaskOptions<R> = {}): Task<A, R> {
	let pending = $state(0);
	let error = $state<unknown>(null);
	const run = async (...args: A): Promise<R | undefined> => {
		pending++;
		error = null;
		try {
			const result = await fn(...args);
			const msg = typeof options.success === 'function' ? options.success(result) : options.success;
			if (msg) toast.ok(msg);
			return result;
		} catch (e) {
			error = e;
			if (options.toastErrors !== false) toast.error(e);
			options.onerror?.(e);
			return undefined;
		} finally {
			pending--;
		}
	};
	Object.defineProperties(run, {
		pending: { get: () => pending > 0 },
		error: { get: () => error }
	});
	return run as Task<A, R>;
}

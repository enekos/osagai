import { afterEach, describe, expect, it, vi } from 'vitest';
import { dialogs, confirm, prompt } from './state/dialog.svelte.js';
import { task } from './state/task.svelte.js';
import { toast } from './state/toast.svelte.js';
import { errorMessage } from './utils/errors.js';
import { iconNames, registerIcons } from './utils/icons.js';
import { toOptions } from './utils/options.js';

afterEach(() => {
	toast.clear();
	while (dialogs.current) dialogs.dismiss();
});

describe('toOptions', () => {
	it('accepts plain values, pairs and option objects', () => {
		expect(toOptions(['a', ['b', 'Bee'], { value: 'c', label: 'Sea', disabled: true }])).toEqual([
			{ value: 'a', label: 'a' },
			{ value: 'b', label: 'Bee' },
			{ value: 'c', label: 'Sea', disabled: true }
		]);
	});

	it('keeps non-string values', () => {
		expect(toOptions<boolean | number>([[true, 'Yes'], [false, 'No'], 3])).toEqual([
			{ value: true, label: 'Yes' },
			{ value: false, label: 'No' },
			{ value: 3, label: '3' }
		]);
	});
});

describe('errorMessage', () => {
	it('reads Error, objects with a message and strings', () => {
		expect(errorMessage(new Error('boom'))).toBe('boom');
		expect(errorMessage({ message: 'nope' })).toBe('nope');
		expect(errorMessage('plain')).toBe('plain');
		expect(errorMessage(42)).toBe('42');
	});
});

describe('toast', () => {
	it('stacks, auto-dismisses and turns errors into text', () => {
		vi.useFakeTimers();
		toast.ok('saved');
		toast.error(new Error('failed'));
		expect(toast.items.map((t) => [t.kind, t.text])).toEqual([['ok', 'saved'], ['error', 'failed']]);
		vi.advanceTimersByTime(3600);
		expect(toast.items.map((t) => t.kind)).toEqual(['error']);
		vi.advanceTimersByTime(3000);
		expect(toast.items).toEqual([]);
		vi.useRealTimers();
	});
});

describe('task', () => {
	it('tracks pending and returns the result', async () => {
		let release!: (v: number) => void;
		const t = task(() => new Promise<number>((r) => (release = r)), { success: (n) => `got ${n}` });
		const run = t();
		expect(t.pending).toBe(true);
		release(7);
		expect(await run).toBe(7);
		expect(t.pending).toBe(false);
		expect(toast.items.at(-1)?.text).toBe('got 7');
	});

	it('toasts errors and resolves undefined instead of throwing', async () => {
		const t = task(async () => {
			throw new Error('bad');
		});
		expect(await t()).toBeUndefined();
		expect(t.error).toBeInstanceOf(Error);
		expect(toast.items.at(-1)).toMatchObject({ kind: 'error', text: 'bad' });
	});

	it('stays quiet when asked to', async () => {
		const seen: unknown[] = [];
		const t = task(async () => { throw new Error('x'); }, { toastErrors: false, onerror: (e) => seen.push(e) });
		await t();
		expect(toast.items).toEqual([]);
		expect(seen).toHaveLength(1);
	});
});

describe('dialogs', () => {
	it('resolves confirm true on accept and false on dismiss', async () => {
		const yes = confirm('Delete it?');
		expect(dialogs.current?.options.title).toBe('Delete it?');
		await dialogs.accept();
		expect(await yes).toBe(true);
		const no = confirm({ title: 'Again?' });
		dialogs.dismiss();
		expect(await no).toBe(false);
	});

	it('queues requests one after the other', async () => {
		const a = confirm('first');
		const b = prompt({ title: 'second', value: 'x' });
		expect(dialogs.current?.options.title).toBe('first');
		await dialogs.accept();
		await a;
		await Promise.resolve();
		expect(dialogs.current?.options.title).toBe('second');
		await dialogs.accept('typed');
		expect(await b).toBe('typed');
		expect(dialogs.current).toBeNull();
	});

	it('runs the action and stays open with the error when it fails', async () => {
		let fail = true;
		const r = confirm({ title: 'Go', action: async () => { if (fail) throw new Error('server said no'); } });
		await dialogs.accept();
		expect(dialogs.current).not.toBeNull();
		expect(dialogs.error).toBe('server said no');
		fail = false;
		await dialogs.accept();
		expect(await r).toBe(true);
	});

	it('resolves prompt null on dismiss', async () => {
		const p = prompt('Name?');
		dialogs.dismiss();
		expect(await p).toBeNull();
	});
});

describe('icons', () => {
	it('registers extra icons', () => {
		registerIcons({ 'my-thing': 'M0 0h1' });
		expect(iconNames()).toContain('my-thing');
		expect(iconNames()).toContain('plus');
	});
});

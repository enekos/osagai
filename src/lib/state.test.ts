import { afterEach, describe, expect, it, vi } from 'vitest';
import { ListCursor } from './state/cursor.svelte.js';
import { dialogs, confirm, prompt } from './state/dialog.svelte.js';
import { task } from './state/task.svelte.js';
import { toast } from './state/toast.svelte.js';
import { errorMessage } from './utils/errors.js';
import { iconNames, registerIcons } from './utils/icons.js';
import { toOptions } from './utils/options.js';
import { placeBox } from './utils/position.js';

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

describe('placeBox', () => {
	const view = { width: 1000, height: 800 };
	const panel = { width: 200, height: 300 };

	it('opens below the anchor, start-aligned, when there is room', () => {
		expect(placeBox({ left: 100, top: 100, width: 80, height: 30 }, panel, view)).toEqual({ left: 100, top: 134, side: 'bottom', room: 658 });
	});

	it('flips above when below is too short and above fits', () => {
		const p = placeBox({ left: 100, top: 600, width: 80, height: 30 }, panel, view);
		expect(p.side).toBe('top');
		expect(p.top).toBe(600 - 4 - 300);
	});

	it('stays on the roomier side when neither fits, and reports the room to cap height', () => {
		const tall = { width: 200, height: 700 };
		const p = placeBox({ left: 100, top: 300, width: 80, height: 30 }, tall, view);
		expect(p.side).toBe('bottom');
		expect(p.room).toBe(800 - 330 - 4 - 8);
		expect(placeBox({ left: 100, top: 500, width: 80, height: 30 }, tall, view)).toMatchObject({ side: 'top', top: 8, room: 488 });
	});

	it('end-aligns to the anchor and clamps into the viewport', () => {
		expect(placeBox({ left: 700, top: 100, width: 100, height: 30 }, panel, view, { align: 'end' }).left).toBe(600);
		expect(placeBox({ left: 900, top: 100, width: 50, height: 30 }, panel, view).left).toBe(1000 - 200 - 8);
		expect(placeBox({ left: -40, top: 100, width: 50, height: 30 }, panel, view).left).toBe(8);
	});

	it('covers the anchor: top edges meet below, bottom edges meet when flipped', () => {
		expect(placeBox({ left: 100, top: 100, width: 80, height: 40 }, panel, view, { cover: true })).toMatchObject({ top: 100, side: 'bottom', room: 692 });
		expect(placeBox({ left: 100, top: 600, width: 80, height: 40 }, panel, view, { cover: true })).toMatchObject({ top: 340, side: 'top' });
	});

	it('treats a point as a zero-size anchor', () => {
		expect(placeBox({ left: 50, top: 50, width: 0, height: 0 }, panel, view, { gap: 0 })).toMatchObject({ left: 50, top: 50, side: 'bottom' });
	});
});

describe('ListCursor', () => {
	const key = (k: string) => new KeyboardEvent('keydown', { key: k, cancelable: true });

	it('clamps by default and wraps with loop', () => {
		let n = 3;
		const clamped = new ListCursor(() => n);
		clamped.move(-1);
		expect(clamped.active).toBe(0);
		clamped.move(5);
		expect(clamped.active).toBe(2);
		const looped = new ListCursor(() => n, { loop: true });
		looped.move(-1);
		expect(looped.active).toBe(2);
		looped.move(1);
		expect(looped.active).toBe(0);
		n = 0;
		expect(looped.index).toBe(-1);
	});

	it('handles arrows and Enter, and leaves Home/End to the input unless asked', () => {
		const picked: number[] = [];
		const c = new ListCursor(() => 4);
		const down = key('ArrowDown');
		expect(c.keydown(down, (i) => picked.push(i))).toBe(true);
		expect(down.defaultPrevented).toBe(true);
		c.keydown(key('Enter'), (i) => picked.push(i));
		expect(picked).toEqual([1]);
		expect(c.keydown(key('End'), () => {})).toBe(false);
		const withEnds = new ListCursor(() => 4, { homeEnd: true });
		withEnds.keydown(key('End'), () => {});
		expect(withEnds.active).toBe(3);
		expect(c.keydown(key('a'), () => {})).toBe(false);
	});

	it('keeps index inside a list that shrank', () => {
		let n = 5;
		const c = new ListCursor(() => n);
		c.to(4);
		n = 2;
		expect(c.index).toBe(1);
	});
});

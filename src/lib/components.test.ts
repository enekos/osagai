import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import Button from './components/actions/Button.svelte';
import Checkbox from './components/forms/Checkbox.svelte';
import Select from './components/forms/Select.svelte';
import Tabs from './components/forms/Tabs.svelte';
import Overlays from './components/overlays/Overlays.svelte';
import { confirm, dialogs } from './state/dialog.svelte.js';
import { toast } from './state/toast.svelte.js';

let mounted: Record<string, unknown>[] = [];
function render<P extends Record<string, unknown>>(component: any, props: P) {
	const target = document.createElement('div');
	document.body.appendChild(target);
	const instance = mount(component, { target, props });
	mounted.push(instance);
	flushSync();
	return target;
}

afterEach(() => {
	for (const m of mounted) unmount(m);
	mounted = [];
	document.body.innerHTML = '';
	toast.clear();
	while (dialogs.current) dialogs.dismiss();
});

describe('Button', () => {
	it('renders a link when given href and a typed button otherwise', () => {
		const a = render(Button, { href: '/x', icon: 'plus', label: 'Add' });
		expect(a.querySelector('a')?.getAttribute('href')).toBe('/x');
		expect(a.querySelector('a')?.getAttribute('aria-label')).toBe('Add');
		const b = render(Button, { icon: 'plus', label: 'Add' });
		expect(b.querySelector('button')?.getAttribute('type')).toBe('button');
	});

	it('disables itself and reports busy while loading', () => {
		const t = render(Button, { loading: true, label: 'Save', icon: 'check' });
		const btn = t.querySelector('button')!;
		expect(btn.disabled).toBe(true);
		expect(btn.getAttribute('aria-busy')).toBe('true');
	});
});

describe('Checkbox', () => {
	it('accepts an undefined checked value', () => {
		const t = render(Checkbox, { checked: undefined, label: 'Required' });
		expect(t.querySelector('input')?.checked).toBe(false);
		expect(t.textContent).toContain('Required');
	});
});

describe('Select', () => {
	it('builds options from pairs and a placeholder', () => {
		const t = render(Select, { value: 'b', options: [['a', 'A'], ['b', 'B']], placeholder: 'Pick' });
		const opts = [...t.querySelectorAll('option')].map((o) => o.textContent);
		expect(opts).toEqual(['Pick', 'A', 'B']);
		expect(t.querySelector('select')?.value).toBe('b');
	});
});

describe('Tabs', () => {
	it('marks the active tab and calls onchange', () => {
		let picked = '';
		const t = render(Tabs, { value: 'one', items: [['one', 'One'], { value: 'two', label: 'Two', badge: 3 }], onchange: (v: string) => (picked = v) });
		const tabs = t.querySelectorAll('[role="tab"]');
		expect(tabs[0].getAttribute('aria-selected')).toBe('true');
		expect(tabs[1].textContent).toContain('3');
		(tabs[1] as HTMLButtonElement).click();
		flushSync();
		expect(picked).toBe('two');
		expect(tabs[1].getAttribute('aria-selected')).toBe('true');
	});
});

describe('Overlays', () => {
	it('shows a confirm dialog and resolves when accepted', async () => {
		render(Overlays, {});
		const answer = confirm({ title: 'Delete it?', message: 'Gone for good.', confirmLabel: 'Delete' });
		flushSync();
		expect(document.body.textContent).toContain('Delete it?');
		const ok = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Delete')!;
		ok.click();
		expect(await answer).toBe(true);
	});

	it('shows toasts', () => {
		render(Overlays, {});
		toast.ok('Saved');
		flushSync();
		expect(document.querySelector('[role="status"]')?.textContent).toContain('Saved');
	});
});

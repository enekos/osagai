import { createRawSnippet, flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import Button from './components/actions/Button.svelte';
import Checkbox from './components/forms/Checkbox.svelte';
import Combobox from './components/forms/Combobox.svelte';
import ContextMenu from './components/actions/ContextMenu.svelte';
import Menu from './components/actions/Menu.svelte';
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

const menuItems = createRawSnippet(() => ({ render: () => '<div><button role="menuitem">One</button><button role="menuitem">Two</button></div>' }));
const key = (el: Element, k: string) => {
	el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
	flushSync();
};
const pointerdown = (el: Element) => {
	el.dispatchEvent(new Event('pointerdown', { bubbles: true }));
	flushSync();
};

describe('Combobox', () => {
	it('filters as you type and picks with the keyboard', () => {
		const picked: unknown[] = [];
		const t = render(Combobox, { value: null, options: [['de', 'Germany'], ['es', 'Spain'], ['fr', 'France']], label: 'Country', onchange: (v: unknown) => picked.push(v) });
		const input = t.querySelector('input')!;
		expect(input.getAttribute('role')).toBe('combobox');
		input.value = 'an';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();
		const labels = () => [...t.querySelectorAll('[role="option"]')].map((o) => o.textContent?.trim());
		expect(labels()).toEqual(['Germany', 'France']);
		key(input, 'ArrowDown');
		expect(input.getAttribute('aria-activedescendant')).toBe(t.querySelectorAll('[role="option"]')[1].id);
		key(input, 'Enter');
		expect(picked).toEqual(['fr']);
		expect(t.querySelector('[role="listbox"]')).toBeNull();
		expect(input.value).toBe('France');
	});

	it('closes on Escape without changing the value, and says when nothing matches', () => {
		const t = render(Combobox, { value: 'es', options: [['es', 'Spain']], empty: 'No country' });
		const input = t.querySelector('input')!;
		expect(input.value).toBe('Spain');
		input.value = 'zz';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();
		expect(t.textContent).toContain('No country');
		key(input, 'Escape');
		expect(t.querySelector('[role="listbox"]')).toBeNull();
		expect(input.value).toBe('Spain');
	});
});

describe('Menu', () => {
	it('opens fixed next to its trigger and closes on a pointer down outside', () => {
		const t = render(Menu, { children: menuItems });
		t.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')!.click();
		flushSync();
		const panel = t.querySelector<HTMLElement>('[role="menu"]')!;
		expect(panel.style.position).toBe('fixed');
		expect(panel.dataset.side).toBe('bottom');
		pointerdown(panel.querySelector('button')!);
		expect(t.querySelector('[role="menu"]')).not.toBeNull();
		pointerdown(document.body);
		expect(t.querySelector('[role="menu"]')).toBeNull();
	});
});

describe('ContextMenu', () => {
	it('anchors to an element as well as a point, and Escape closes it', () => {
		const header = document.createElement('button');
		document.body.appendChild(header);
		const t = render(ContextMenu, { at: header, children: menuItems });
		const panel = t.querySelector<HTMLElement>('[role="menu"]')!;
		expect(panel.style.position).toBe('fixed');
		expect(document.activeElement?.textContent).toBe('One');
		pointerdown(header);
		expect(t.querySelector('[role="menu"]')).not.toBeNull();
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		flushSync();
		expect(t.querySelector('[role="menu"]')).toBeNull();
	});
});

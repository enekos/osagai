import { createRawSnippet, flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Button from './components/actions/Button.svelte';
import Checkbox from './components/forms/Checkbox.svelte';
import Choice from './components/forms/Choice.svelte';
import Input from './components/forms/Input.svelte';
import Kbd from './components/display/Kbd.svelte';
import Breadcrumbs from './components/navigation/Breadcrumbs.svelte';
import CodeView from './components/display/CodeView.svelte';
import Prose from './components/display/Prose.svelte';
import Combobox from './components/forms/Combobox.svelte';
import DatePicker from './components/forms/DatePicker.svelte';
import ContextMenu from './components/actions/ContextMenu.svelte';
import Menu from './components/actions/Menu.svelte';
import Select from './components/forms/Select.svelte';
import Tabs from './components/forms/Tabs.svelte';
import Overlays from './components/overlays/Overlays.svelte';
import Popover from './components/overlays/Popover.svelte';
import Collapsible from './components/layout/Collapsible.svelte';
import AccordionFixture from './accordion.test.svelte';
import SelectionBar from './components/actions/SelectionBar.svelte';
import QueryError from './components/feedback/QueryError.svelte';
import DescriptionList from './components/display/DescriptionList.svelte';
import TopProgress from './components/feedback/TopProgress.svelte';
import AvatarGroup from './components/display/AvatarGroup.svelte';
import { confirm, dialogs } from './state/dialog.svelte.js';
import { toast } from './state/toast.svelte.js';
import { tooltips } from './state/tooltip.svelte.js';

Element.prototype.scrollIntoView = vi.fn();

let mounted: Record<string, unknown>[] = [];
function render(component: any, props: Record<string, unknown>) {
	const target = document.createElement('div');
	document.body.appendChild(target);
	const instance = mount(component, { target, props });
	mounted.push(instance);
	flushSync();
	return target;
}

afterEach(() => {
	for (const m of mounted) void unmount(m);
	mounted = [];
	document.body.innerHTML = '';
	toast.clear();
	tooltips.clear();
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
		expect(tabs[0]!.getAttribute('aria-selected')).toBe('true');
		expect(tabs[1]!.textContent).toContain('3');
		(tabs[1] as HTMLButtonElement).click();
		flushSync();
		expect(picked).toBe('two');
		expect(tabs[1]!.getAttribute('aria-selected')).toBe('true');
	});
});

describe('Overlays', () => {
	it('shows a confirm dialog and resolves when accepted', async () => {
		render(Overlays, {});
		const answer = confirm({ title: 'Delete it?', message: 'Gone for good.', confirmLabel: 'Delete' });
		flushSync();
		expect(document.body.textContent).toContain('Delete it?');
		const ok = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Delete')!;
		ok.click();
		expect(await answer).toBe(true);
	});

	it('shows toasts', () => {
		render(Overlays, {});
		toast.ok('Saved');
		flushSync();
		expect(document.querySelector('[role="status"]')?.textContent).toContain('Saved');
	});

	it('runs a toast action and dismisses the toast', () => {
		render(Overlays, {});
		const undo = vi.fn();
		toast.ok('Deleted', { action: { label: 'Undo', run: undo } });
		flushSync();
		const button = [...document.querySelectorAll('button')].find((b) => b.textContent === 'Undo')!;
		button.click();
		flushSync();
		expect(undo).toHaveBeenCalledOnce();
		expect(document.body.textContent).not.toContain('Deleted');
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
		const labels = () => [...t.querySelectorAll('[role="option"]')].map((o) => o.textContent.trim());
		expect(labels()).toEqual(['Germany', 'France']);
		key(input, 'ArrowDown');
		expect(input.getAttribute('aria-activedescendant')).toBe(t.querySelectorAll('[role="option"]')[1]!.id);
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

describe('DatePicker', () => {
	const focused = () => (document.activeElement as HTMLElement).dataset.date;

	it('opens on the chosen month, moves with the keyboard and picks with Enter', () => {
		const picked: unknown[] = [];
		const t = render(DatePicker, { value: '2026-01-31', locale: 'en-GB', name: 'due', onchange: (v: unknown) => picked.push(v) });
		const trigger = t.querySelector('button')!;
		expect(trigger.textContent).toContain('31 Jan 2026');
		trigger.click();
		flushSync();
		expect(t.querySelector('[role="dialog"]')?.textContent).toContain('January 2026');
		expect(focused()).toBe('2026-01-31');
		key(document.activeElement!, 'ArrowRight');
		expect(focused()).toBe('2026-02-01');
		expect(t.querySelector('[role="dialog"]')?.textContent).toContain('February 2026');
		key(document.activeElement!, 'PageUp');
		expect(focused()).toBe('2026-01-01');
		(document.activeElement as HTMLButtonElement).click();
		flushSync();
		expect(picked).toEqual(['2026-01-01']);
		expect(t.querySelector('[role="dialog"]')).toBeNull();
		expect(document.activeElement).toBe(trigger);
		expect(t.querySelector<HTMLInputElement>('input[name="due"]')?.value).toBe('2026-01-01');
	});

	it('keeps the cursor inside min and max, and Escape closes without picking', () => {
		const picked: unknown[] = [];
		const t = render(DatePicker, { value: null, min: '2026-03-10', max: '2026-03-20', onchange: (v: unknown) => picked.push(v) });
		t.querySelector('button')!.click();
		flushSync();
		expect(focused()).toBe('2026-03-20');
		expect(t.querySelector<HTMLButtonElement>('[data-date="2026-03-21"]')?.disabled).toBe(true);
		key(document.activeElement!, 'ArrowDown');
		expect(focused()).toBe('2026-03-20');
		key(document.activeElement!, 'PageUp');
		expect(focused()).toBe('2026-03-10');
		key(document.activeElement!, 'Escape');
		expect(t.querySelector('[role="dialog"]')).toBeNull();
		expect(picked).toEqual([]);
	});

	it('starts the week on the given day', () => {
		const t = render(DatePicker, { value: '2026-10-27', weekStart: 0, locale: 'en-US' });
		t.querySelector('button')!.click();
		flushSync();
		const heads = [...t.querySelectorAll('th')].map((h) => h.textContent);
		expect(heads[0]).toBe('Sun');
		expect(t.querySelector('[data-date]')?.getAttribute('data-date')).toBe('2026-09-27');
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

describe('tooltip', () => {
	it('shows a Button label after a hover delay, describes the element and hides on Escape', () => {
		vi.useFakeTimers();
		try {
			render(Overlays, {});
			const t = render(Button, { icon: 'trash', label: 'Delete', title: 'Removes it for good' });
			const btn = t.querySelector('button')!;
			expect(btn.getAttribute('title')).toBeNull();
			btn.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
			expect(document.querySelector('[role="tooltip"]')).toBeNull();
			vi.advanceTimersByTime(400);
			flushSync();
			const tip = document.querySelector<HTMLElement>('[role="tooltip"]')!;
			expect(tip.textContent).toBe('Removes it for good');
			expect(tip.style.position).toBe('fixed');
			expect(btn.getAttribute('aria-describedby')).toBe(tip.id);
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
			flushSync();
			expect(document.querySelector('[role="tooltip"]')).toBeNull();
			expect(btn.getAttribute('aria-describedby')).toBeNull();
		} finally {
			vi.useRealTimers();
		}
	});

	it('ignores touch and does not describe an element whose aria-label is the same text', () => {
		vi.useFakeTimers();
		try {
			render(Overlays, {});
			const t = render(Button, { icon: 'plus', label: 'Add' });
			const btn = t.querySelector('button')!;
			btn.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'touch' }));
			vi.advanceTimersByTime(1000);
			flushSync();
			expect(document.querySelector('[role="tooltip"]')).toBeNull();
			btn.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
			vi.advanceTimersByTime(400);
			flushSync();
			expect(document.querySelector('[role="tooltip"]')?.textContent).toBe('Add');
			expect(btn.getAttribute('aria-describedby')).toBeNull();
			btn.dispatchEvent(new PointerEvent('pointerleave'));
			flushSync();
			expect(document.querySelector('[role="tooltip"]')).toBeNull();
		} finally {
			vi.useRealTimers();
		}
	});
});

describe('Choice', () => {
	it('is a radiogroup of cards: click picks, arrows move and pick, disabled is skipped', () => {
		const seen: string[] = [];
		const t = render(Choice, { value: 'a', options: [{ value: 'a', label: 'Ay', description: 'first', icon: 'plus' }, { value: 'b', label: 'Bee', disabled: true }, ['c', 'Sea']], onchange: (v: string) => seen.push(v) });
		const radios = t.querySelectorAll<HTMLButtonElement>('[role="radio"]');
		expect(t.querySelector('[role="radiogroup"]')).not.toBeNull();
		expect(radios).toHaveLength(3);
		expect(radios[0]!.getAttribute('aria-checked')).toBe('true');
		expect(radios[0]!.tabIndex).toBe(0);
		expect(radios[2]!.tabIndex).toBe(-1);
		expect(radios[0]!.textContent).toContain('first');
		key(radios[0]!, 'ArrowRight');
		expect(radios[2]!.getAttribute('aria-checked')).toBe('true');
		expect(document.activeElement).toBe(radios[2]);
		radios[1]!.click();
		flushSync();
		expect(radios[2]!.getAttribute('aria-checked')).toBe('true');
		radios[0]!.click();
		flushSync();
		expect(radios[0]!.getAttribute('aria-checked')).toBe('true');
		expect(seen).toEqual(['c', 'a']);
	});
});

describe('Input', () => {
	it('takes a bare class for inline editing', () => {
		const t = render(Input, { value: 'x', bare: true });
		expect(t.querySelector('input')?.classList.contains('o-bare')).toBe(true);
	});
});

describe('Kbd', () => {
	it('formats a key spec', () => {
		const el = render(Kbd, { keys: 'shift+enter' });
		expect(el.textContent).toMatch(/^(⇧↵|Shift\+↵)$/);
	});
});

describe('Breadcrumbs', () => {
	it('links every crumb but the last, which is the current page', () => {
		const t = render(Breadcrumbs, { items: [{ label: 'repo', href: '/repo' }, { label: 'src', href: '/repo/src' }, { label: 'lib', href: '/repo/src/lib' }] });
		const links = [...t.querySelectorAll('a')].map((a) => a.getAttribute('href'));
		expect(links).toEqual(['/repo', '/repo/src']);
		expect(t.querySelector('[aria-current="page"]')?.textContent).toBe('lib');
		expect(t.querySelectorAll('.o-sep')).toHaveLength(2);
	});
});

describe('CodeView', () => {
	it('escapes plain text and numbers lines with anchors', () => {
		const t = render(CodeView, { text: 'a <b>\n\nc\n' });
		const rows = t.querySelectorAll('.o-row');
		expect(rows).toHaveLength(3);
		expect(t.querySelector('#L1 .o-src')?.innerHTML).toBe('a &lt;b&gt;');
		expect(t.querySelector('#L3 a.o-ln')?.getAttribute('href')).toBe('#L3');
	});

	it('takes pre-highlighted lines as HTML and honours start and anchor', () => {
		const t = render(CodeView, { lines: ['<span class="k">let</span> x'], start: 40, anchor: 'P' });
		expect(t.querySelector('#P40 .k')?.textContent).toBe('let');
	});

	it('drops anchors and numbers when asked', () => {
		const t = render(CodeView, { text: 'x', anchor: '', numbers: false });
		expect(t.querySelector('.o-row')?.id).toBe('');
		expect(t.querySelector('.o-ln')).toBeNull();
	});
});

describe('Prose', () => {
	it('renders trusted HTML', () => {
		const t = render(Prose, { html: '<h2>Hi</h2><p>there</p>', serif: true });
		expect(t.querySelector('.o-prose.o-serif h2')?.textContent).toBe('Hi');
	});
});

const popoverBody = createRawSnippet(() => ({ render: () => '<div><input aria-label="Name" /><button>Apply</button></div>' }));
const text = (t: string) => createRawSnippet(() => ({ render: () => `<span>${t}</span>` }));

describe('Popover', () => {
	it('opens a labelled dialog, focuses its first field, and Escape closes it and refocuses the trigger', () => {
		const t = render(Popover, { text: 'Filter', title: 'Filters', children: popoverBody });
		const trigger = t.querySelector<HTMLButtonElement>('[aria-haspopup="dialog"]')!;
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		trigger.click();
		flushSync();
		const panel = t.querySelector<HTMLElement>('[role="dialog"]')!;
		expect(panel.style.position).toBe('fixed');
		expect(panel.getAttribute('aria-label')).toBe('Filters');
		expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(document.activeElement?.getAttribute('aria-label')).toBe('Name');
		key(panel.querySelector('input')!, 'Escape');
		expect(t.querySelector('[role="dialog"]')).toBeNull();
		expect(document.activeElement).toBe(trigger);
	});

	it('closes on a pointer down outside', () => {
		const t = render(Popover, { text: 'Filter', open: true, children: popoverBody });
		pointerdown(t.querySelector('input')!);
		expect(t.querySelector('[role="dialog"]')).not.toBeNull();
		pointerdown(document.body);
		expect(t.querySelector('[role="dialog"]')).toBeNull();
	});
});

describe('Collapsible', () => {
	it('toggles its region and keeps a closed one inert', () => {
		const ontoggle = vi.fn();
		const t = render(Collapsible, { title: 'Details', ontoggle, children: text('Body') });
		const head = t.querySelector<HTMLButtonElement>('button')!;
		const panel = t.querySelector<HTMLElement>('[role="region"]')!;
		expect(head.getAttribute('aria-expanded')).toBe('false');
		expect(head.getAttribute('aria-controls')).toBe(panel.id);
		expect(panel.inert).toBe(true);
		head.click();
		flushSync();
		expect(head.getAttribute('aria-expanded')).toBe('true');
		expect(panel.inert).toBe(false);
		expect(ontoggle).toHaveBeenCalledWith(true);
	});
});

describe('Accordion', () => {
	const expanded = (t: HTMLElement) => [...t.querySelectorAll('.o-collapsible-head')].map((b) => b.getAttribute('aria-expanded'));

	it('keeps one section open at a time and moves between headers with the arrows', () => {
		const t = render(AccordionFixture, {});
		expect(expanded(t)).toEqual(['true', 'false', 'false']);
		const heads = t.querySelectorAll<HTMLButtonElement>('.o-collapsible-head');
		heads[1]!.click();
		flushSync();
		expect(expanded(t)).toEqual(['false', 'true', 'false']);
		heads[1]!.focus();
		key(heads[1]!, 'ArrowDown');
		expect(document.activeElement).toBe(heads[2]);
		key(heads[2]!, 'ArrowDown');
		expect(document.activeElement).toBe(heads[0]);
	});

	it('lets several stay open with multiple', () => {
		const t = render(AccordionFixture, { multiple: true });
		t.querySelectorAll<HTMLButtonElement>('.o-collapsible-head')[2]!.click();
		flushSync();
		expect(expanded(t)).toEqual(['true', 'false', 'true']);
	});
});

describe('SelectionBar', () => {
	it('announces the count, hides at zero and clears on Escape', () => {
		const onclear = vi.fn();
		const t = render(SelectionBar, { count: 3, onclear, noun: ['row', 'rows'] });
		expect(t.querySelector('[role="toolbar"]')?.textContent).toContain('3 rows selected');
		expect(t.querySelector('[aria-live]')?.textContent).toBe('3 rows selected');
		key(document.body, 'Escape');
		expect(onclear).toHaveBeenCalledOnce();
		const none = render(SelectionBar, { count: 0, onclear });
		expect(none.querySelector('[role="toolbar"]')).toBeNull();
		key(document.body, 'Escape');
		expect(onclear).toHaveBeenCalledTimes(2);
	});

	it('leaves Escape alone inside a field', () => {
		const onclear = vi.fn();
		render(SelectionBar, { count: 1, onclear });
		const input = document.createElement('input');
		document.body.appendChild(input);
		key(input, 'Escape');
		expect(onclear).not.toHaveBeenCalled();
	});
});

describe('QueryError', () => {
	it('renders nothing without an error, and the message with a working retry', async () => {
		expect(render(QueryError, {}).querySelector('[role="alert"]')).toBeNull();
		const onretry = vi.fn();
		const t = render(QueryError, { error: new Error('Timed out'), onretry });
		expect(t.querySelector('[role="alert"]')?.textContent).toContain('Timed out');
		t.querySelector('button')!.click();
		await Promise.resolve();
		expect(onretry).toHaveBeenCalledOnce();
	});
});

describe('DescriptionList', () => {
	it('pairs terms with values and shows a dash for an empty one', () => {
		const t = render(DescriptionList, { items: [{ term: 'Owner', value: 'Ane' }, { term: 'Due', value: null }] });
		expect([...t.querySelectorAll('dt')].map((d) => d.textContent)).toEqual(['Owner', 'Due']);
		expect([...t.querySelectorAll('dd')].map((d) => d.textContent.trim())).toEqual(['Ane', '—']);
	});
});

describe('TopProgress', () => {
	it('waits out the delay so a fast navigation never flashes', () => {
		vi.useFakeTimers();
		try {
			const t = render(TopProgress, { active: true, delay: 100 });
			expect(t.querySelector('.o-top-progress')).toBeNull();
			vi.advanceTimersByTime(100);
			flushSync();
			expect(t.querySelector('.o-top-progress')).not.toBeNull();
		} finally {
			vi.useRealTimers();
		}
	});
});

describe('AvatarGroup', () => {
	it('shows up to max and folds the rest into a count', () => {
		const t = render(AvatarGroup, { names: ['Ane', 'Bea', 'Cai', 'Dan', 'Eli'], max: 3 });
		expect(t.querySelectorAll('.o-avatar')).toHaveLength(2);
		expect(t.querySelector('.o-more')?.textContent).toBe('+3');
		expect(t.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('Ane, Bea, Cai, Dan, Eli');
	});
});

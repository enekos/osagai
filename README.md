# @enekos/osagai

A small component kit for Svelte 5. It has no dependencies. It covers what an app UI needs every day: buttons, form fields, menus, dialogs, toasts, tables, tabs and page layout. It also has an imperative `confirm()`/`prompt()`, a `task()` helper for writes and a `query()` helper for reads, which together remove most of the `busy`/`try`/`catch`/`toast` boilerplate, a `draft()` helper that tracks unsaved changes, `shortcuts()` for keyboard shortcuts and `copy()` for the clipboard. Every visual decision is a CSS variable, and light and dark themes are built in.

*Osagai* is Basque for "component".

On npm: [@enekos/osagai](https://www.npmjs.com/package/@enekos/osagai).

```sh
pnpm add @enekos/osagai
```

```svelte
<script lang="ts">
	import { Button, Field, Input, Modal, Page, confirm, task } from '@enekos/osagai';

	let open = $state(false);
	let name = $state('');
	const save = task(() => api.post('/things', { name }), { success: 'Saved' });

	async function remove() {
		if (await confirm({ title: 'Delete it?', action: () => api.del('/things/1') })) goto('/things');
	}
</script>

<Page title="Things" description="Everything you own.">
	{#snippet actions()}
		<Button variant="primary" icon="plus" onclick={() => (open = true)}>New thing</Button>
	{/snippet}
	<Button danger icon="trash" label="Delete" onclick={remove} />
</Page>

<Modal bind:open title="New thing">
	<Field label="Name" hint="Shown to everyone."><Input bind:value={name} autofocus /></Field>
	{#snippet footer()}
		<Button onclick={() => (open = false)}>Cancel</Button>
		<Button variant="primary" loading={save.pending} onclick={() => save()}>Save</Button>
	{/snippet}
</Modal>
```

## Setup

Import the theme once, add the base styles if you want element defaults and utilities, and mount `<Overlays />` once. Toasts and dialogs render inside `<Overlays />`.

```svelte
<!-- +layout.svelte -->
<script lang="ts">
	import '@enekos/osagai/styles/theme.css';
	import '@enekos/osagai/styles/base.css';
	import { Overlays } from '@enekos/osagai';
	let { children } = $props();
</script>

{@render children()}
<Overlays />
```

- `styles/theme.css`: required. It defines the `--o-*` tokens for light and dark. Dark mode follows the OS unless `<html data-theme="light|dark">` overrides it.
- `styles/base.css`: optional. It sets body, heading, link and code defaults, styles raw `<input>`/`<select>`/`<textarea>` like the components (at zero specificity), and adds a few utilities: `row`, `stack`, `between`, `grow`, `wrap`, `muted`, `faint`, `small`, `tiny`, `truncate`, `mono`, `mt`, `mb`, `label`, `eyebrow`, `sr-only`.

## Components

| | What it is | Notable props |
|---|---|---|
| `Button` | a button, or a link when it gets `href` | `variant` default·primary·ai·ghost, `danger`, `size` md·sm, `icon`, `iconRight`, `loading`, `pressed`, `block`, `flat`, `wrap` (lets a long label wrap onto more lines). Leave out the children and it becomes a square icon button whose `label` is its `aria-label` and tooltip. A `title` on any button is shown as a tooltip too, never as the native one. It defaults to `type="button"`. |
| `Field` | a label + a control + a hint or an error | `label` (string or snippet), `hint`, `error`, `optional`, `grow`, an `aside` snippet. It gives its control an `id` and `aria-describedby` through context, so `for=`/`id=` pairs are never needed. |
| `Input` `Textarea` | text controls | `bind:value`, `size`, `mono`, `bare` (no border or padding, inherits the font: an editable title), `bind:element`; any other attribute passes through |
| `Select` | a native select | `options` accepts `['a', 'b']`, `[['a', 'Label A']]` or `[{ value, label, disabled }]`, and values keep their type (`true`, `3`, `null`). Also `placeholder` (a `null` option) and `size`. Children can still be raw `<option>`s. |
| `Combobox` | a text input that filters a list of options | `bind:value`, `options` (same shapes as `Select`), `placeholder`, `empty` (the no-match text), `size`, `label`, `onchange`. Arrow keys move, Enter picks, Escape closes and keeps the old value. |
| `Listbox` | the option list behind `Combobox`, for building your own | `items`, `bind:active`, `onpick(item, index)`, an `item(item, { index, active })` snippet, an `empty` snippet, `id`. Each option's id is `` `${id}-${index}` ``, so the input that owns the keyboard can point `aria-activedescendant` at it. Options pick on mousedown, so the input keeps focus. |
| `Checkbox` `Switch` `RadioGroup` | choices | `bind:checked` (undefined is fine), `label`, `hint`; `RadioGroup` takes `bind:value` + `options` |
| `Choice` | a radio group drawn as cards | `bind:value`, `options` (same shapes as `Select`, plus `description` and `icon`), `columns`, `label`, `onchange`. Arrow keys move and pick, disabled options are skipped. |
| `Tabs` | a segmented control | `bind:value`, `items` (same shapes as `options`, plus `badge`), `size`, `block`, `onchange`. Roving tabindex: arrow keys/Home/End move focus between tabs. |
| `Dropzone` | file drop + click to choose | `onfiles(files)`, `accept`, `multiple`, `busy`, `title`, `hint` |
| `Chip` | a small toggle or insert button | `selected`, `mono` |
| `Menu` `MenuItem` `MenuSeparator` | a dropdown that owns its open state | `icon`/`text`/`label` for the default trigger, or a `trigger(props)` snippet to spread on your own button. Arrow keys, Escape and click-outside all work. Items take `icon`, `danger`, `checked`, `href`, `hint`, and close the menu when clicked. |
| `ContextMenu` | a menu at a point or under an element | `bind:at={{ x, y } \| element \| null}`, with `MenuItem` children. It closes on Escape, on a click outside and on scroll. |
| `Modal` | a dialog | `bind:open`, `title`, `size` sm·md·lg·xl or `width`, `footer` and `headerActions` snippets, `dismissible`, `onclose`. It focuses its first field, traps Tab inside the dialog, restores focus on close, locks scroll, and lets Escape close only the top dialog. |
| `Drawer` | a side panel | `bind:open`, `title`, `width`, `actions` snippet. Same focus handling as `Modal`: `role="dialog"`, initial focus, a Tab trap and focus restore on close. |
| `Page` | the page frame and header | `title`/`description` (string or snippet), `back={{ href, label }}`, `eyebrow`, `actions` snippet, `width` |
| `Card` | a bordered surface | `title`, `description`, `actions` snippet, `padding` none·sm·md, `tone` soft·danger·accent |
| `Tile` | a card that is a link or a button | `title`, `icon`, `description`, `href` or `onclick`, `dashed`, `accent`, `aside` snippet, children as meta text. The title is a stretched link, so controls in `aside` stay clickable. |
| `Table` | a styled `<table>` you fill with `thead`/`tbody` | `framed`, `compact`, `sticky`, `maxHeight`, `minWidth`, `scroll`. Cell classes `num`, `mono`, `actions` and `empty`, and row class `dim`, are styled. |
| `Badge` `Notice` `Empty` `Stat` `Skeleton` `Spinner` `Kbd` `Avatar` `Icon` | display | `tone` on Badge/Notice; `Kbd keys="mod+k"` shows ⌘K on a Mac and Ctrl+K elsewhere; `Icon` takes any name from the built-in set or from `registerIcons({ name: 'svg path' })` |

## Imperative helpers

```ts
import { confirm, prompt, toast, task } from '@enekos/osagai';

await confirm('Delete this row?');                       // true / false
await confirm({ title, message, confirmLabel, danger, typeToConfirm, action });
// action runs inside the dialog: a spinner while it runs, the error inline if it throws

await prompt({ title: 'Rename', label: 'Name', value: old, required: true }); // string / null

toast.ok('Saved'); toast.info('Queued'); toast.error(err);   // error() takes anything thrown
toast.ok('Archived', { action: { label: 'Undo', run: () => api.post(`/things/1/restore`) } });
// the button dismisses the toast, then runs; a throw or rejection becomes an error toast

const save = task(async (id: string) => api.put(id), { success: 'Saved' });
save('42');            // never throws: errors become a toast and `save.error`
save.pending;          // reactive, for <Button loading={save.pending}>
```

Requests queue up, so two `confirm()` calls show one after the other. A toast lasts 3.5s, or 6s for an error or one with an action; pass `{ ms }` to change it (`0` keeps it until dismissed). An app that draws its own toasts reads `toast.items` and calls `toast.act(id)` for the action.

### Keyboard: `shortcuts()`

Call it while the component is being set up. It listens on `window` until the component is destroyed.

```ts
import { shortcuts } from '@enekos/osagai';

shortcuts({
	'mod+k': () => (palette = !palette),
	'mod+s': () => d.dirty && save(),
	j: next,
	k: prev,
	'?': () => (help = true)
});
```

- `mod` is ⌘ on a Mac and Ctrl elsewhere. `ctrl`, `meta`, `alt` and `shift` mean exactly that key. Modifiers must match: `k` does not fire on Ctrl+K. Shift is ignored for symbols, so write `?`, not `shift+/`. Names: `esc`, `enter`, `space`, `tab`, `up`/`down`/`left`/`right`, `backspace`, `delete`.
- A key without a modifier is ignored while the focus is in a field, a contenteditable, or an open `Modal`, `Drawer`, `Menu` or listbox: those own the keyboard. A key with a modifier always fires.
- The handler gets the event and the default is prevented, unless the handler returns `false`. An event another handler already prevented is skipped.
- `enabled: () => boolean` pauses all of them. `keyboardBusy(target)` is the field-or-overlay test on its own, and `Kbd keys` formats the same strings for a help list.

### Clipboard: `copy()`

```svelte
<script>
	import { Button, copy, copied } from '@enekos/osagai';
</script>

<Button icon={copied(url) ? 'check' : 'copy'} onclick={() => copy(url, { toast: 'Link copied' })}>{copied(url) ? 'Copied' : 'Copy link'}</Button>
```

- `copy(text, { toast })` resolves to `true` or `false` and never throws. It toasts `Copied` unless `toast` is another text or `false`, and toasts the error if the browser refuses. Without the async clipboard API (an insecure origin) it copies through a hidden selection.
- `copied(text)` is reactive and true for 1.5s after that text was copied, so a row of copy buttons needs no state of its own. `copied()` is true after any copy.

### Reads: `query()`

`query()` is the read-side twin of `task()`. Call it while the component is being set up: it runs at once, reruns when anything it read changes (`ws` below), and keeps the last data while it reloads.

```svelte
<script>
	import { query, Skeleton, Empty, Notice, errorMessage } from '@enekos/osagai';
	const things = query(() => api.get(`/w/${ws}/things`).then((r) => r.items), { every: 5000 });
</script>

{#if things.error}
	<Notice tone="error">{errorMessage(things.error)}</Notice>
{:else if !things.loaded}
	<Skeleton />
{:else if things.data.length === 0}
	<Empty title="No things yet" />
{:else}
	…
{/if}
```

- `data`, `pending`, `loaded` and `error` are reactive. `loaded` turns true after the first successful load and stays true, so `pending` alone never hides what is already on screen.
- `reload()` fetches again and returns the result. `set(value)` replaces the data without a fetch, for when a save already returned the new object.
- A response that arrives after a newer load started is dropped.
- `every: ms` polls, waiting for the previous response first and pausing while the tab is hidden. `enabled: () => boolean` stops the query (and the polling) while it is false.
- Errors stay inline in `error` so the page can show them where the data was. `toastErrors: true` toasts them as well.

### Unsaved changes: `draft()`

`draft()` watches a value and tells you whether it differs from the last snapshot. Nothing is set by hand.

```svelte
<script>
	import { draft } from '@enekos/osagai';
	let form = $state({ name: '', steps: [] });
	const d = draft(() => form);
	const save = task(async () => { await api.put('/things/1', form); d.commit(); }, { success: 'Saved' });
</script>

<Button variant="primary" loading={save.pending} disabled={!d.dirty} onclick={() => save()}>{d.dirty ? 'Save' : 'Saved'}</Button>
```

- `dirty` is derived by comparing a `$state.snapshot` of the value with the last committed one (`JSON.stringify` by default, or pass `equal`).
- Call `commit()` after loading the value and after each save.
- While dirty it answers `beforeunload`, so closing the tab asks first; `guard: false` turns that off. In-app navigation is the router's business, so the kit only exposes the predicate. In SvelteKit:

```ts
beforeNavigate((nav) => {
	if (!d.dirty || nav.type === 'leave' || !nav.to) return;
	nav.cancel();
	confirm({ title: 'Leave without saving?', confirmLabel: 'Leave' }).then((ok) => ok && goto(nav.to!.url));
});
```

## Tooltips

`Button` shows its `title` and an icon button's `label` as a tooltip. The same action works on anything:

```svelte
<span use:tooltip={'Filled by AI'}>…</span>
<span use:tooltip={{ text: col.description, side: 'bottom', delay: 500 }}>…</span>
```

It opens after a short hover (350ms) or on keyboard focus, flips to the side with room, closes on pointer leave, blur, pointer down and Escape, and ignores touch. While open it sets `aria-describedby` on the element, unless the text is already its `aria-label`. Tooltips render inside `<Overlays />`, like toasts, so pass an empty text to show nothing.

## Anchored panels

`Menu`, `ContextMenu` and `Combobox` place their panels with one action that you can use too:

```svelte
<script>
	import { anchor, Listbox, ListCursor } from '@enekos/osagai';
	let input = $state();
	const cursor = new ListCursor(() => items.length, { loop: true });
</script>

<input bind:this={input} onkeydown={(e) => cursor.keydown(e, (i) => pick(items[i]))} />
{#if open}
	<div class="pop" use:anchor={{ to: input, matchWidth: true, onoutside: close }}>
		<Listbox {items} bind:active={cursor.active} onpick={pick}>…</Listbox>
	</div>
{/if}
```

- `to` is an element, a `{ left, top, width, height }` box, or a `{ x, y }` point.
- The panel is `position: fixed`. It opens on `side` (`bottom` by default), flips when only the other side has room, clamps into the viewport with `margin` (8px), and moves with scroll and resize. `align` is `start` or `end`, `gap` is 4px, and `cover: true` lays it over the anchor rather than next to it.
- It sets `data-side` on the panel, plus `--o-anchor-room` (the height available) and `--o-anchor-width` for your CSS: `max-height: min(320px, var(--o-anchor-room))`.
- `onoutside` fires on a pointer down outside both the panel and the anchor element.
- An ancestor with `transform`, `filter` or `contain` becomes the containing block of a fixed element, so don't render an anchored panel inside one.

`placeBox(anchor, panel, viewport, options)` is the pure function behind it. `ListCursor` is the keyboard half: `active`, `index` (clamped to the current length, `-1` when empty), `move`, `to`, and `keydown(e, pick)`, which handles the arrows and Enter (plus Home/End with `homeEnd: true`) and returns whether it used the key.

## Theming

Override any `--o-*` variable on `:root`, or on any element if you want to scope it:

```css
:root {
	--o-accent: #0f766e;
	--o-accent-2: #115e59;
	--o-radius: 6px;
	--o-shadow: none;
	--o-font: 'Inter', system-ui, sans-serif;
}
```

The tokens are: surfaces `--o-bg`, `--o-surface`, `--o-surface-2`, `--o-surface-3`; lines `--o-border`, `--o-border-strong`, `--o-line`; text `--o-text`, `--o-text-2`, `--o-text-3`, `--o-ink`; accents `--o-accent*`, `--o-mark*`, `--o-ok*`, `--o-warn*`, `--o-danger*`; shape `--o-radius`, `--o-radius-lg`, `--o-shadow*`, `--o-control-h`, `--o-control-h-sm`; a ten-colour chart palette `--o-c1`…`--o-c10`.

## Layout of the source

```
src/lib/
  components/
    actions/    Button, Chip, Menu, MenuItem, MenuSeparator, ContextMenu
    forms/      Field, Input, Textarea, Select, Combobox, Listbox, Checkbox, Switch, RadioGroup, Choice, Tabs, Dropzone
    overlays/   Modal, Drawer, Overlays
    layout/     Page, Card, Tile, Table
    feedback/   Notice, Empty, Spinner, Skeleton
    display/    Badge, Stat, Avatar, Kbd, Icon
  actions/      anchor, tooltip
  state/        toast, dialog, tooltip, task, query, draft, cursor, shortcuts, clipboard (runes, .svelte.ts)
  context/      field and menu context keys
  utils/        icons, options, errors, position, focus, keys
  styles/       theme.css, base.css
```

## Develop

```sh
pnpm install
pnpm test     # vitest: state logic + mounted components (jsdom)
pnpm check    # svelte-check
pnpm build    # svelte-package → dist/
```

MIT.

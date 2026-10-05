# @enekos/osagai

A small component kit for Svelte 5. It has no dependencies. It covers what an app UI needs every day: buttons, form fields, menus, dialogs, toasts, tables, tabs and page layout. It also has an imperative `confirm()`/`prompt()` and a `task()` helper, which together remove most of the `busy`/`try`/`catch`/`toast` boilerplate. Every visual decision is a CSS variable, and light and dark themes are built in.

*Osagai* is Basque for "component". It started as the UI layer of [bikote](https://github.com/enekos/bikote).

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
| `Button` | a button, or a link when it gets `href` | `variant` default·primary·ai·ghost, `danger`, `size` md·sm, `icon`, `iconRight`, `loading`, `pressed`, `block`, `flat`. Leave out the children and it becomes a square icon button whose `label` is its `aria-label` and tooltip. It defaults to `type="button"`. |
| `Field` | a label + a control + a hint or an error | `label` (string or snippet), `hint`, `error`, `optional`, `grow`, an `aside` snippet. It gives its control an `id` and `aria-describedby` through context, so `for=`/`id=` pairs are never needed. |
| `Input` `Textarea` | text controls | `bind:value`, `size`, `mono`, `bind:element`; any other attribute passes through |
| `Select` | a native select | `options` accepts `['a', 'b']`, `[['a', 'Label A']]` or `[{ value, label, disabled }]`, and values keep their type (`true`, `3`, `null`). Also `placeholder` (a `null` option) and `size`. Children can still be raw `<option>`s. |
| `Checkbox` `Switch` `RadioGroup` | choices | `bind:checked` (undefined is fine), `label`, `hint`; `RadioGroup` takes `bind:value` + `options` |
| `Tabs` | a segmented control | `bind:value`, `items` (same shapes as `options`, plus `badge`), `size`, `block`, `onchange` |
| `Dropzone` | file drop + click to choose | `onfiles(files)`, `accept`, `multiple`, `busy`, `title`, `hint` |
| `Chip` | a small toggle or insert button | `selected`, `mono` |
| `Menu` `MenuItem` `MenuSeparator` | a dropdown that owns its open state | `icon`/`text`/`label` for the default trigger, or a `trigger(props)` snippet to spread on your own button. Arrow keys, Escape and click-outside all work. Items take `icon`, `danger`, `checked`, `href`, `hint`, and close the menu when clicked. |
| `ContextMenu` | a menu at a point | `bind:at={{ x, y } \| null}`, with `MenuItem` children |
| `Modal` | a dialog | `bind:open`, `title`, `size` sm·md·lg·xl or `width`, `footer` and `headerActions` snippets, `dismissible`, `onclose`. It focuses its first field, restores focus on close, locks scroll, and lets Escape close only the top dialog. |
| `Drawer` | a side panel | `bind:open`, `title`, `width`, `actions` snippet |
| `Page` | the page frame and header | `title`/`description` (string or snippet), `back={{ href, label }}`, `eyebrow`, `actions` snippet, `width` |
| `Card` | a bordered surface | `title`, `description`, `actions` snippet, `padding` none·sm·md, `tone` soft·danger·accent |
| `Tile` | a card that is a link or a button | `title`, `icon`, `description`, `href` or `onclick`, `dashed`, `accent`, `aside` snippet, children as meta text. The title is a stretched link, so controls in `aside` stay clickable. |
| `Table` | a styled `<table>` you fill with `thead`/`tbody` | `framed`, `compact`, `sticky`, `maxHeight`, `minWidth`, `scroll`. Cell classes `num`, `mono`, `actions` and `empty`, and row class `dim`, are styled. |
| `Badge` `Notice` `Empty` `Stat` `Skeleton` `Spinner` `Kbd` `Avatar` `Icon` | display | `tone` on Badge/Notice; `Icon` takes any name from the built-in set or from `registerIcons({ name: 'svg path' })` |

## Imperative helpers

```ts
import { confirm, prompt, toast, task } from '@enekos/osagai';

await confirm('Delete this row?');                       // true / false
await confirm({ title, message, confirmLabel, danger, typeToConfirm, action });
// action runs inside the dialog: a spinner while it runs, the error inline if it throws

await prompt({ title: 'Rename', label: 'Name', value: old, required: true }); // string / null

toast.ok('Saved'); toast.info('Queued'); toast.error(err);   // error() takes anything thrown

const save = task(async (id: string) => api.put(id), { success: 'Saved' });
save('42');            // never throws: errors become a toast and `save.error`
save.pending;          // reactive, for <Button loading={save.pending}>
```

Requests queue up, so two `confirm()` calls show one after the other.

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
    forms/      Field, Input, Textarea, Select, Checkbox, Switch, RadioGroup, Tabs, Dropzone
    overlays/   Modal, Drawer, Overlays
    layout/     Page, Card, Tile, Table
    feedback/   Notice, Empty, Spinner, Skeleton
    display/    Badge, Stat, Avatar, Kbd, Icon
  state/        toast, dialog, task (runes, .svelte.ts)
  context/      field and menu context keys
  utils/        icons, options, errors
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

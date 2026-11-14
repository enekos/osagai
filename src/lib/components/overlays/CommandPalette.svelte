<script lang="ts" module>
	import type { IconName } from '../../utils/icons.js';

	export interface Command {
		id: string;
		title: string;
		group?: string;
		subtitle?: string;
		icon?: IconName;
		keywords?: readonly string[];
		keys?: string;
		href?: string;
		run?: () => unknown;
	}

	export interface PaletteAsk {
		label: string;
		run: (query: string) => unknown;
	}

	/** 0 for no match; higher is better. A prefix beats a word start beats a substring beats a subsequence. */
	export function scoreCommand(c: Command, query: string): number {
		const q = query.trim().toLowerCase();
		if (!q) return 1;
		const title = c.title.toLowerCase();
		if (title === q) return 100;
		if (title.startsWith(q)) return 80;
		if (new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(title)) return 60;
		if (title.includes(q)) return 40;
		const extra = [c.subtitle ?? '', c.group ?? '', ...(c.keywords ?? [])].join(' ').toLowerCase();
		if (extra.includes(q)) return 30;
		let at = 0;
		for (const ch of title) if (ch === q[at]) at++;
		return at === q.length ? 10 : 0;
	}
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import Icon from '../display/Icon.svelte';
	import Kbd from '../display/Kbd.svelte';
	import { ListCursor } from '../../state/cursor.svelte.js';
	import { matchKeys, parseKeys } from '../../utils/keys.js';
	import { trapTab } from '../../utils/focus.js';

	const uid = $props.id();

	let {
		open = $bindable(false),
		commands,
		hotkey = 'mod+k',
		placeholder = 'Type a command or search…',
		empty = 'Nothing matches.',
		label = 'Command palette',
		ask,
		onselect
	}: {
		open?: boolean;
		commands: readonly Command[];
		hotkey?: string | null;
		placeholder?: string;
		empty?: string;
		label?: string;
		ask?: PaletteAsk;
		onselect?: (command: Command) => void;
	} = $props();

	const listId = `o-palette-${uid}`;
	let query = $state('');
	let input: HTMLInputElement | undefined = $state();
	let panel: HTMLDivElement | undefined = $state();

	type Row = { kind: 'command'; command: Command } | { kind: 'ask' };
	interface Group { name: string; rows: { row: Row; index: number }[] }

	const ranked = $derived.by(() => {
		const scored = commands.map((c, i) => ({ c, i, s: scoreCommand(c, query) })).filter((x) => x.s > 0);
		if (query.trim()) scored.sort((a, b) => b.s - a.s || a.i - b.i);
		const groups: { name: string; commands: Command[] }[] = [];
		for (const { c } of scored) {
			const name = c.group ?? '';
			const group = groups.find((g) => g.name === name);
			if (group) group.commands.push(c);
			else groups.push({ name, commands: [c] });
		}
		return groups;
	});

	const view = $derived.by(() => {
		const groups: Group[] = [];
		const flat: Row[] = [];
		for (const g of ranked) {
			const rows = g.commands.map((command) => {
				const row: Row = { kind: 'command', command };
				return { row, index: flat.push(row) - 1 };
			});
			groups.push({ name: g.name, rows });
		}
		if (ask && query.trim()) {
			const row: Row = { kind: 'ask' };
			groups.push({ name: '', rows: [{ row, index: flat.push(row) - 1 }] });
		}
		return { groups, flat };
	});

	const cursor = new ListCursor(() => view.flat.length, { loop: true });

	$effect(() => {
		const spec = hotkey;
		if (!spec) return;
		const combo = parseKeys(spec);
		function onkey(e: KeyboardEvent) {
			if (e.defaultPrevented || e.isComposing || !matchKeys(e, combo)) return;
			e.preventDefault();
			open = !open;
		}
		window.addEventListener('keydown', onkey);
		return () => window.removeEventListener('keydown', onkey);
	});

	$effect(() => {
		if (!open) return;
		const before = document.activeElement as HTMLElement | null;
		untrack(() => {
			query = '';
			cursor.to(0);
		});
		requestAnimationFrame(() => input?.focus());
		return () => before?.focus();
	});

	$effect(() => {
		if (!open || cursor.index < 0) return;
		document.getElementById(`${listId}-${cursor.index}`)?.scrollIntoView({ block: 'nearest' });
	});

	function follow(href: string) {
		// A real anchor click, so a client router (SvelteKit) intercepts it like any other link.
		const a = document.createElement('a');
		a.href = href;
		a.style.display = 'none';
		document.body.appendChild(a);
		a.click();
		a.remove();
	}

	function choose(i: number) {
		const row = view.flat[i];
		if (!row) return;
		const q = query;
		open = false;
		if (row.kind === 'ask') {
			void ask?.run(q);
			return;
		}
		onselect?.(row.command);
		if (row.command.run) void row.command.run();
		else if (row.command.href) follow(row.command.href);
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.stopPropagation();
			open = false;
			return;
		}
		if (e.key === 'Tab' && panel) {
			trapTab(e, panel);
			return;
		}
		if (e.isComposing) return;
		cursor.keydown(e, choose);
	}
</script>

{#if open}
	<div class="o-palette-backdrop" role="presentation" onmousedown={(e) => { if (e.target === e.currentTarget) open = false; }}>
		<div class="o-palette" role="dialog" aria-modal="true" aria-label={label} tabindex="-1" bind:this={panel} {onkeydown}>
			<div class="o-palette-search">
				<Icon name="search" size={16} />
				<input
					bind:this={input}
					bind:value={query}
					oninput={() => cursor.to(0)}
					{placeholder}
					role="combobox"
					aria-expanded="true"
					aria-controls={listId}
					aria-autocomplete="list"
					aria-activedescendant={cursor.index >= 0 ? `${listId}-${cursor.index}` : undefined}
					aria-label={label}
					autocomplete="off"
					spellcheck="false" />
			</div>
			<div class="o-palette-list" id={listId} role="listbox" aria-label={label}>
				{#each view.groups as group, g (g)}
					<div role="group" aria-label={group.name || undefined}>
						{#if group.name}<div class="o-palette-group" aria-hidden="true">{group.name}</div>{/if}
						{#each group.rows as { row, index } (index)}
							<div
								id="{listId}-{index}"
								class="o-palette-row"
								class:o-active={index === cursor.index}
								role="option"
								tabindex="-1"
								aria-selected={index === cursor.index}
								onmousedown={(e) => { e.preventDefault(); choose(index); }}
								onmousemove={() => { if (cursor.active !== index) cursor.to(index); }}>
								{#if row.kind === 'ask'}
									<span class="o-palette-icon o-ask"><Icon name="sparkles" size={14} /></span>
									<span class="o-palette-text"><span class="o-palette-title">{ask?.label}: <q>{query.trim()}</q></span></span>
								{:else}
									<span class="o-palette-icon"><Icon name={row.command.icon ?? (row.command.href ? 'chevron' : 'bolt')} size={14} /></span>
									<span class="o-palette-text">
										<span class="o-palette-title">{row.command.title}</span>
										{#if row.command.subtitle}<span class="o-palette-sub">{row.command.subtitle}</span>{/if}
									</span>
									{#if row.command.keys}<Kbd keys={row.command.keys} />{/if}
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<div class="o-palette-empty" role="presentation">{empty}</div>
				{/each}
			</div>
			<div class="o-palette-foot" aria-hidden="true">
				<span><Kbd keys="up" /><Kbd keys="down" /> move</span>
				<span><Kbd keys="enter" /> open</span>
				<span><Kbd keys="esc" /> close</span>
			</div>
		</div>
	</div>
{/if}

<style>
	.o-palette-backdrop { position: fixed; inset: 0; z-index: 60; display: flex; justify-content: center; align-items: flex-start; padding: 12vh 16px 16px; background: var(--o-scrim); animation: o-palette-fade var(--o-duration) var(--o-ease-out); }
	.o-palette { display: flex; flex-direction: column; width: 100%; max-width: 620px; max-height: min(560px, 76vh); background: var(--o-surface); color: var(--o-text); border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius-lg); box-shadow: var(--o-shadow-lg); outline: none; overflow: hidden; }
	.o-palette-search { display: flex; align-items: center; gap: 10px; padding: 0 14px; border-bottom: var(--o-line) solid var(--o-border-strong); color: var(--o-text-3); }
	.o-palette-search input { flex: 1; min-width: 0; height: 48px; padding: 0; border: none; outline: none; background: none; box-shadow: none; color: var(--o-text); font-size: 16px; }
	.o-palette-list { flex: 1; overflow: auto; padding: 6px; }
	.o-palette-group { padding: 8px 8px 4px; font-size: 11.5px; font-weight: 700; color: var(--o-text-3); }
	.o-palette-row { display: flex; align-items: center; gap: 10px; padding: 7px 8px; border: 1px solid transparent; border-radius: var(--o-radius); cursor: pointer; }
	.o-palette-row.o-active { background: var(--o-surface-2); border-color: var(--o-border-strong); }
	.o-palette-icon { flex: none; display: inline-grid; place-items: center; width: 26px; height: 26px; border: 1px solid var(--o-border); border-radius: var(--o-radius); color: var(--o-text-2); background: var(--o-surface); }
	.o-active .o-palette-icon { border-color: var(--o-border-strong); color: var(--o-text); }
	.o-ask { background: var(--o-mark); color: var(--o-mark-ink); border-color: var(--o-mark-ink); }
	.o-palette-text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
	.o-palette-title { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.o-palette-sub { font-size: 12px; color: var(--o-text-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.o-palette-empty { padding: 18px 8px; text-align: center; color: var(--o-text-3); }
	.o-palette-foot { display: flex; gap: 16px; padding: 7px 14px; border-top: 1px solid var(--o-border); background: var(--o-surface-2); font-size: 11.5px; color: var(--o-text-3); }
	.o-palette-foot span { display: inline-flex; align-items: center; gap: 4px; }
	@keyframes o-palette-fade { from { opacity: 0; } }
	@media (max-width: 760px) {
		.o-palette-backdrop { padding: 8px; }
		.o-palette { max-height: calc(100dvh - 16px); }
		.o-palette-foot { display: none; }
	}
</style>

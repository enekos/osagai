<script lang="ts" generics="T">
	import Input from './Input.svelte';
	import Listbox from './Listbox.svelte';
	import Icon from '../display/Icon.svelte';
	import { anchor } from '../../actions/anchor.js';
	import { ListCursor } from '../../state/cursor.svelte.js';
	import { toOptions, type Option, type OptionInput } from '../../utils/options.js';

	const uid = $props.id();

	let {
		value = $bindable(null),
		options,
		placeholder = 'Search…',
		empty: emptyText = 'Nothing matches',
		size = 'md',
		label,
		disabled = false,
		onchange,
		class: className = ''
	}: {
		value?: T | null;
		options: readonly OptionInput<T>[];
		placeholder?: string;
		empty?: string;
		size?: 'md' | 'sm';
		label?: string;
		disabled?: boolean;
		onchange?: (value: T) => void;
		class?: string;
	} = $props();

	const listId = `o-cb-${uid}`;
	let input: HTMLInputElement | undefined = $state();
	let open = $state(false);
	let query = $state<string | null>(null);

	const all = $derived(toOptions(options).filter((o) => !o.disabled));
	const chosen = $derived(all.find((o) => Object.is(o.value, value)));
	const shown = $derived.by(() => {
		const q = query?.trim().toLowerCase();
		return q ? all.filter((o) => o.label.toLowerCase().includes(q)) : all;
	});
	const cursor = new ListCursor(() => shown.length, { loop: true });

	function show() {
		if (disabled || open) return;
		open = true;
		cursor.to(Math.max(0, shown.findIndex((o) => o === chosen)));
	}
	function close() {
		open = false;
		query = null;
	}
	function pick(o: Option<T>) {
		value = o.value;
		close();
		onchange?.(o.value);
	}
	function onkeydown(e: KeyboardEvent) {
		if (!open) {
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				e.preventDefault();
				show();
			}
			return;
		}
		if (e.key === 'Escape') {
			e.preventDefault();
			e.stopPropagation();
			close();
			return;
		}
		if (e.key === 'Tab') return close();
		cursor.keydown(e, (i) => pick(shown[i]));
	}
</script>

<span class="o-combo {className}">
	<Input
		bind:element={input}
		value={query ?? chosen?.label ?? ''}
		{size}
		{placeholder}
		{disabled}
		role="combobox"
		autocomplete="off"
		spellcheck="false"
		aria-label={label}
		aria-autocomplete="list"
		aria-expanded={open}
		aria-controls={listId}
		aria-activedescendant={open && cursor.index >= 0 ? `${listId}-${cursor.index}` : undefined}
		oninput={(e) => {
			query = e.currentTarget.value;
			open = true;
			cursor.to(0);
		}}
		onclick={() => (open ? close() : show())}
		onblur={close}
		{onkeydown} />
	<span class="o-combo-caret" aria-hidden="true"><Icon name="chevron-down" size={14} /></span>
	{#if open}
		<div class="o-combo-pop" use:anchor={{ to: input, matchWidth: true, onoutside: close }}>
			<Listbox items={shown} bind:active={cursor.active} id={listId} onpick={(o) => pick(o)}>
				{#snippet item(o)}
					<span class="o-combo-label">{o.label}</span>
					{#if o === chosen}<Icon name="check" size={13} />{/if}
				{/snippet}
				{#snippet empty()}{emptyText}{/snippet}
			</Listbox>
		</div>
	{/if}
</span>

<style>
	.o-combo { position: relative; display: block; min-width: 0; }
	.o-combo :global(.o-control) { padding-right: 28px; }
	.o-combo-caret { position: absolute; right: 8px; top: 50%; translate: 0 -50%; display: inline-flex; color: var(--o-text-3); pointer-events: none; }
	.o-combo-pop { z-index: 70; background: var(--o-surface); border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius); box-shadow: var(--o-shadow-lg); }
	.o-combo-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>

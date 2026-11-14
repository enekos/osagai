<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '../actions/Button.svelte';
	import type { IconName } from '../../utils/icons.js';
	import { anchor } from '../../actions/anchor.js';
	import { trapTab } from '../../utils/focus.js';
	import type { Side } from '../../utils/position.js';

	interface TriggerProps { onclick: (e: MouseEvent) => void; 'aria-haspopup': 'dialog'; 'aria-expanded': boolean; 'aria-controls': string }

	const uid = $props.id();

	let {
		open = $bindable(false),
		title,
		side = 'bottom',
		align = 'start',
		width,
		icon,
		text,
		label = 'Open',
		variant = 'default',
		size = 'md',
		onclose,
		trigger,
		children
	}: {
		open?: boolean;
		title?: string;
		side?: Side;
		align?: 'start' | 'end';
		width?: string;
		icon?: IconName;
		text?: string;
		label?: string;
		variant?: 'default' | 'primary' | 'ai' | 'ghost';
		size?: 'md' | 'sm';
		onclose?: () => void;
		trigger?: Snippet<[TriggerProps]>;
		children: Snippet<[{ close: () => void }]>;
	} = $props();

	const panelId = `o-popover-${uid}`;
	let root: HTMLSpanElement | undefined = $state();
	let panel: HTMLDivElement | undefined = $state();

	function triggerEl(): HTMLElement | null | undefined {
		return root?.querySelector<HTMLElement>(`[aria-controls="${panelId}"]`);
	}

	function close(refocus = false) {
		if (!open) return;
		open = false;
		onclose?.();
		if (refocus) triggerEl()?.focus();
	}

	const triggerProps: TriggerProps = {
		onclick: (e: MouseEvent) => {
			e.stopPropagation();
			if (open) close();
			else open = true;
		},
		'aria-haspopup': 'dialog',
		'aria-controls': panelId,
		get 'aria-expanded'() {
			return open;
		}
	};

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.stopPropagation();
			close(true);
			return;
		}
		if (e.key === 'Tab' && panel) trapTab(e, panel);
	}

	$effect(() => {
		if (!open || !panel) return;
		const target = panel.querySelector<HTMLElement>('[autofocus], :is(input, select, textarea, button):not([disabled]), a[href]') ?? panel;
		target.focus();
	});
</script>

<span class="o-popover-root" bind:this={root}>
	{#if trigger}
		{@render trigger(triggerProps)}
	{:else if text}
		<Button {variant} {size} {icon} {...triggerProps}>{text}</Button>
	{:else}
		<Button {variant} {size} icon={icon ?? 'more'} {label} {...triggerProps} />
	{/if}
	{#if open}
		<div
			id={panelId}
			class="o-popover"
			role="dialog"
			aria-label={title ?? label}
			tabindex="-1"
			style:width
			bind:this={panel}
			{onkeydown}
			use:anchor={{ to: root, side, align, onoutside: () => close() }}>
			{#if title}<div class="o-popover-title">{title}</div>{/if}
			<div class="o-popover-body">{@render children({ close: () => close(true) })}</div>
		</div>
	{/if}
</span>

<style>
	.o-popover-root { position: relative; display: inline-flex; }
	.o-popover {
		z-index: 30; min-width: 220px; max-width: min(420px, calc(100vw - 16px)); max-height: min(520px, var(--o-anchor-room, 70vh)); overflow: auto;
		background: var(--o-surface); color: var(--o-text); border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius); box-shadow: var(--o-shadow-lg); outline: none;
		animation: o-popover-in var(--o-duration) var(--o-ease-out);
	}
	.o-popover-title { padding: 8px 12px; font-size: 12px; font-weight: 700; border-bottom: var(--o-line) solid var(--o-border-strong); background: var(--o-surface-2); }
	.o-popover-body { padding: 12px; }
	@keyframes o-popover-in { from { opacity: 0; } }
</style>

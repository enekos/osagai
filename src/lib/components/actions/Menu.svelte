<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';
	import type { IconName } from '../../utils/icons.js';
	import { setMenu } from '../../context/menu.js';

	type TriggerProps = { onclick: (e: MouseEvent) => void; 'aria-haspopup': 'menu'; 'aria-expanded': boolean };

	let {
		open = $bindable(false),
		align = 'right',
		icon = 'more',
		text,
		label = 'More actions',
		variant = 'ghost',
		size = 'sm',
		width,
		trigger,
		children
	}: {
		open?: boolean;
		align?: 'left' | 'right';
		icon?: IconName;
		text?: string;
		label?: string;
		variant?: 'default' | 'primary' | 'ai' | 'ghost';
		size?: 'md' | 'sm';
		width?: string;
		trigger?: Snippet<[TriggerProps]>;
		children: Snippet;
	} = $props();

	let root: HTMLSpanElement | undefined = $state();
	let panel: HTMLDivElement | undefined = $state();
	let above = $state(false);

	function close(refocus = false) {
		open = false;
		if (refocus) root?.querySelector<HTMLElement>('[aria-haspopup="menu"]')?.focus();
	}
	setMenu(() => close());

	const triggerProps: TriggerProps = {
		onclick: (e: MouseEvent) => {
			e.stopPropagation();
			open = !open;
		},
		'aria-haspopup': 'menu',
		get 'aria-expanded'() {
			return open;
		}
	};

	function items(): HTMLElement[] {
		return panel ? [...panel.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])')] : [];
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.stopPropagation();
			close(true);
			return;
		}
		if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
		e.preventDefault();
		const list = items();
		const at = list.indexOf(document.activeElement as HTMLElement);
		const next = e.key === 'Home' ? 0 : e.key === 'End' ? list.length - 1 : e.key === 'ArrowDown' ? (at + 1) % list.length : (at - 1 + list.length) % list.length;
		list[next]?.focus();
	}

	$effect(() => {
		if (!open) return;
		above = false;
		requestAnimationFrame(() => {
			if (!panel) return;
			const r = panel.getBoundingClientRect();
			above = r.bottom > window.innerHeight - 8 && r.height < r.top;
		});
		const away = (e: MouseEvent) => {
			if (root && !root.contains(e.target as Node)) close();
		};
		document.addEventListener('mousedown', away);
		return () => document.removeEventListener('mousedown', away);
	});
</script>

<span class="o-menu-root" bind:this={root}>
	{#if trigger}
		{@render trigger(triggerProps)}
	{:else}
		{#if text}
			<Button {variant} {size} {icon} onclick={triggerProps.onclick} aria-haspopup="menu" aria-expanded={open}>{text}</Button>
		{:else}
			<Button {variant} {size} {icon} {label} onclick={triggerProps.onclick} aria-haspopup="menu" aria-expanded={open} />
		{/if}
	{/if}
	{#if open}
		<div class="o-menu" class:o-above={above} bind:this={panel} role="menu" tabindex="-1" style="{align}: 0" style:min-width={width} {onkeydown}>
			{@render children()}
		</div>
	{/if}
</span>

<style>
	.o-menu-root { position: relative; display: inline-flex; }
	.o-menu { position: absolute; top: calc(100% + 4px); z-index: 30; min-width: 200px; max-height: min(420px, 70vh); overflow: auto; background: var(--o-surface); color: var(--o-text); border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius); box-shadow: var(--o-shadow-lg); padding: 4px; outline: none; }
	.o-above { top: auto; bottom: calc(100% + 4px); }
</style>

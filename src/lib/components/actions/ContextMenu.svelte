<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setMenu } from '../../context/menu.js';
	import { anchor } from '../../actions/anchor.js';

	let { at = $bindable(null), children }: { at?: { x: number; y: number } | HTMLElement | null; children: Snippet } = $props();

	let panel: HTMLDivElement | undefined = $state();
	setMenu(() => close());

	function close() {
		at = null;
	}

	$effect(() => {
		if (!at) return;
		panel?.querySelector<HTMLElement>('[role^="menuitem"]')?.focus({ preventScroll: true });
		const key = (e: KeyboardEvent) => {
			if (e.key === 'Escape') close();
		};
		const scrolled = (e: Event) => {
			if (!panel?.contains(e.target as Node)) close();
		};
		document.addEventListener('keydown', key);
		window.addEventListener('scroll', scrolled, true);
		return () => {
			document.removeEventListener('keydown', key);
			window.removeEventListener('scroll', scrolled, true);
		};
	});

	function onkeydown(e: KeyboardEvent) {
		if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
		e.preventDefault();
		const list = panel ? [...panel.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([disabled])')] : [];
		const i = list.indexOf(document.activeElement as HTMLElement);
		list[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]?.focus();
	}
</script>

{#if at}
	<div class="o-context" bind:this={panel} role="menu" tabindex="-1" {onkeydown} use:anchor={{ to: at, gap: at instanceof HTMLElement ? 4 : 0, onoutside: close }}>
		{@render children()}
	</div>
{/if}

<style>
	.o-context { z-index: 60; min-width: 200px; max-height: min(420px, var(--o-anchor-room, 70vh)); overflow: auto; background: var(--o-surface); color: var(--o-text); border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius); box-shadow: var(--o-shadow-lg); padding: 4px; outline: none; }
</style>

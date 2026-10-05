<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setMenu } from '../../context/menu.js';

	let { at = $bindable(null), children }: { at?: { x: number; y: number } | null; children: Snippet } = $props();

	let panel: HTMLDivElement | undefined = $state();
	let pos = $state({ x: 0, y: 0 });
	setMenu(() => (at = null));

	$effect(() => {
		if (!at) return;
		pos = { ...at };
		requestAnimationFrame(() => {
			if (!panel || !at) return;
			const r = panel.getBoundingClientRect();
			pos = { x: Math.min(at.x, window.innerWidth - r.width - 8), y: Math.min(at.y, window.innerHeight - r.height - 8) };
			panel.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
		});
		const away = (e: MouseEvent) => {
			if (panel && !panel.contains(e.target as Node)) at = null;
		};
		const key = (e: KeyboardEvent) => {
			if (e.key === 'Escape') at = null;
		};
		const t = setTimeout(() => document.addEventListener('mousedown', away));
		document.addEventListener('keydown', key);
		window.addEventListener('scroll', close, true);
		return () => {
			clearTimeout(t);
			document.removeEventListener('mousedown', away);
			document.removeEventListener('keydown', key);
			window.removeEventListener('scroll', close, true);
		};
	});

	function close() {
		at = null;
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
		e.preventDefault();
		const list = panel ? [...panel.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])')] : [];
		const i = list.indexOf(document.activeElement as HTMLElement);
		list[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]?.focus();
	}
</script>

{#if at}
	<div class="o-context" bind:this={panel} role="menu" tabindex="-1" style:left="{pos.x}px" style:top="{pos.y}px" {onkeydown}>
		{@render children()}
	</div>
{/if}

<style>
	.o-context { position: fixed; z-index: 60; min-width: 200px; background: var(--o-surface); color: var(--o-text); border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius); box-shadow: var(--o-shadow-lg); padding: 4px; outline: none; }
</style>

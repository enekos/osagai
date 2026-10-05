<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../display/Icon.svelte';
	import { trapTab } from '../../utils/focus.js';

	let {
		open = $bindable(false),
		title,
		width = '540px',
		onclose,
		actions,
		children
	}: { open?: boolean; title: string; width?: string; onclose?: () => void; actions?: Snippet; children: Snippet } = $props();

	let panel: HTMLElement | undefined = $state();

	function close() {
		open = false;
		onclose?.();
	}
	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			if (!document.querySelector('.o-modal')) close();
			return;
		}
		if (e.key === 'Tab' && panel) trapTab(e, panel);
	}

	$effect(() => {
		if (!open) return;
		const before = document.activeElement as HTMLElement | null;
		requestAnimationFrame(() => {
			if (!panel || panel.contains(document.activeElement)) return;
			(panel.querySelector<HTMLElement>('[autofocus]') ?? panel).focus();
		});
		return () => before?.focus?.();
	});
</script>

<svelte:window onkeydown={open ? onkeydown : undefined} />

{#if open}
	<div class="o-drawer" style:width="min({width}, 100vw)" role="dialog" aria-modal="true" aria-label={title} tabindex="-1" bind:this={panel}>
		<header>
			<div class="o-title">
				<button type="button" class="o-close" onclick={close} aria-label="Close"><Icon name="x" size={15} /></button>
				<h2>{title}</h2>
			</div>
			{#if actions}<div class="o-actions">{@render actions()}</div>{/if}
		</header>
		<div class="o-body">{@render children()}</div>
	</div>
{/if}

<style>
	.o-drawer { position: fixed; top: 0; right: 0; bottom: 0; background: var(--o-surface); border-left: var(--o-line) solid var(--o-border-strong); box-shadow: var(--o-shadow-lg); z-index: 40; display: flex; flex-direction: column; }
	header { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 10px 14px; border-bottom: var(--o-line) solid var(--o-border-strong); background: var(--o-ink); color: var(--o-surface); }
	.o-title { display: flex; align-items: center; gap: 8px; min-width: 0; }
	h2 { color: var(--o-surface); font-size: 18px; }
	.o-close { width: 30px; height: 30px; display: inline-grid; place-items: center; border: none; background: transparent; color: var(--o-surface); border-radius: var(--o-radius); cursor: pointer; }
	.o-close:hover { background: var(--o-accent); color: var(--o-accent-ink); }
	.o-actions { display: flex; gap: 6px; align-items: center; }
	.o-actions :global(.o-ghost) { color: var(--o-surface); }
	.o-actions :global(.o-ghost:hover) { background: var(--o-accent); color: var(--o-accent-ink); }
	.o-body { overflow: auto; flex: 1; min-height: 0; }
</style>

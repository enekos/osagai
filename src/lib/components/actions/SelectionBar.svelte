<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';
	import Kbd from '../display/Kbd.svelte';
	import { keyboardBusy } from '../../state/shortcuts.svelte.js';

	let {
		count,
		onclear,
		noun = ['item', 'items'],
		hint,
		label = 'Selection',
		children
	}: {
		count: number;
		onclear: () => void;
		noun?: readonly [string, string];
		hint?: string;
		label?: string;
		children?: Snippet;
	} = $props();

	const text = $derived(`${count.toLocaleString()} ${count === 1 ? noun[0] : noun[1]} selected`);

	function onkeydown(e: KeyboardEvent) {
		if (count === 0 || e.key !== 'Escape' || e.defaultPrevented) return;
		if (keyboardBusy(e.target) && !(e.target instanceof Element && e.target.closest('.o-selection-bar'))) return;
		e.preventDefault();
		onclear();
	}
</script>

<svelte:window {onkeydown} />

<p class="o-selection-live" aria-live="polite">{count > 0 ? text : ''}</p>
{#if count > 0}
	<div class="o-selection-bar" role="toolbar" aria-label={label}>
		<span class="o-count" aria-hidden="true">{text}</span>
		{#if hint}<span class="o-hint">{hint}</span>{/if}
		{#if children}<div class="o-actions">{@render children()}</div>{/if}
		<Button variant="ghost" size="sm" onclick={onclear} aria-label="Clear selection">Clear <Kbd keys="esc" /></Button>
	</div>
{/if}

<style>
	.o-selection-live { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
	.o-selection-bar {
		position: fixed; left: 50%; bottom: 20px; z-index: 40; transform: translateX(-50%);
		display: flex; align-items: center; gap: 10px; max-width: calc(100vw - 32px); padding: 6px 6px 6px 14px;
		background: var(--o-surface); color: var(--o-text); border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius); box-shadow: var(--o-shadow-lg);
		animation: o-selection-in var(--o-duration-slow) var(--o-ease-out);
	}
	.o-count { font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
	.o-hint { font-size: 12.5px; color: var(--o-text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
	.o-actions { display: flex; gap: 6px; align-items: center; padding-left: 10px; border-left: 1px solid var(--o-border); }
	@keyframes o-selection-in { from { opacity: 0; transform: translate(-50%, 8px); } }
	@media (max-width: 760px) {
		.o-selection-bar { left: 8px; right: 8px; bottom: 8px; transform: none; flex-wrap: wrap; animation: none; }
		.o-hint { display: none; }
		.o-selection-bar > :global(:last-child) { margin-left: auto; }
	}
</style>

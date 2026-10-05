<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLTableAttributes } from 'svelte/elements';

	let {
		framed = true,
		compact = false,
		sticky = true,
		minWidth = 560,
		maxHeight,
		scroll = true,
		children,
		class: className = '',
		...rest
	}: HTMLTableAttributes & { framed?: boolean; compact?: boolean; sticky?: boolean; minWidth?: number; maxHeight?: string; scroll?: boolean; children: Snippet } = $props();
</script>

<div class="o-table-wrap" class:o-scroll={scroll} class:o-framed={framed} style:max-height={maxHeight}>
	<table class="o-table {className}" class:o-compact={compact} class:o-sticky={sticky} style:min-width="{minWidth}px" {...rest}>
		{@render children()}
	</table>
</div>

<style>
	.o-table-wrap { min-width: 0; }
	.o-scroll { overflow: auto; }
	.o-framed { background: var(--o-surface); border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius-lg); }
	.o-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; }
	.o-table :global(:is(th, td)) { padding: 8px 12px; border-bottom: 1px solid var(--o-border); text-align: left; vertical-align: middle; line-height: 1.35; }
	.o-compact :global(:is(th, td)) { padding: 5px 10px; }
	.o-table :global(th) { font-weight: 600; font-size: 12px; color: var(--o-surface); background: var(--o-ink); white-space: nowrap; letter-spacing: 0; height: 36px; }
	.o-compact :global(th) { height: 30px; }
	.o-sticky :global(thead th) { position: sticky; top: 0; z-index: 1; }
	.o-table :global(tbody tr:last-child td) { border-bottom: none; }
	.o-table :global(tbody tr:hover td) { background: var(--o-surface-2); }
	.o-table :global(:is(td, th).num) { text-align: right; font-variant-numeric: tabular-nums; }
	.o-table :global(td.num), .o-table :global(td.mono) { font-family: var(--o-mono); font-size: 12.5px; }
	.o-table :global(:is(td, th).actions) { text-align: right; white-space: nowrap; width: 1%; }
	.o-table :global(tr.dim td) { opacity: 0.5; }
	.o-table :global(td.empty) { color: var(--o-text-2); font-size: 12.5px; padding: 18px 12px; }
</style>

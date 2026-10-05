<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	let { selected = false, mono = true, children, class: className = '', ...rest }: HTMLButtonAttributes & { selected?: boolean; mono?: boolean; children: Snippet } = $props();
</script>

<button type="button" class="o-chip {className}" class:o-selected={selected} class:o-mono={mono} aria-pressed={selected} {...rest}>{@render children()}</button>

<style>
	.o-chip { border: 1px solid var(--o-border-strong); background: var(--o-surface); color: var(--o-text); border-radius: 2px; padding: 2px 8px; font: inherit; font-size: 12px; line-height: 1.5; cursor: pointer; white-space: nowrap; }
	.o-mono { font-family: var(--o-mono); font-size: 11.5px; }
	.o-chip:hover { background: var(--o-mark); color: var(--o-mark-ink); }
	.o-selected { background: var(--o-ink); color: var(--o-surface); }
</style>

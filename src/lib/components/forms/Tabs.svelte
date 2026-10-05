<script lang="ts" generics="T">
	import { toOptions, type OptionInput } from '../../utils/options.js';

	let {
		value = $bindable(),
		items,
		size = 'md',
		label,
		block = false,
		onchange
	}: { value: T; items: readonly OptionInput<T>[]; size?: 'md' | 'sm'; label?: string; block?: boolean; onchange?: (value: T) => void } = $props();

	const options = $derived(toOptions(items));
	function pick(v: T) {
		value = v;
		onchange?.(v);
	}
</script>

<div class="o-tabs o-{size}" class:o-block={block} role="tablist" aria-label={label}>
	{#each options as o}
		<button type="button" role="tab" aria-selected={o.value === value} class:o-active={o.value === value} disabled={o.disabled} onclick={() => pick(o.value)}>{o.label}{#if o.badge}<span class="o-count">{o.badge}</span>{/if}</button>
	{/each}
</div>

<style>
	.o-tabs { display: inline-flex; max-width: 100%; overflow-x: auto; border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius); background: var(--o-surface); flex-shrink: 0; }
	button { padding: 7px 14px; border: none; border-right: 1px solid var(--o-border-strong); background: none; color: var(--o-text-2); font: inherit; font-weight: 600; font-size: 13px; white-space: nowrap; cursor: pointer; }
	button:last-child { border-right: none; }
	button:hover { color: var(--o-text); background: var(--o-surface-2); }
	.o-active, .o-active:hover { color: var(--o-surface); background: var(--o-ink); }
	.o-sm button { padding: 4px 10px; font-size: 12px; }
	.o-block { display: flex; width: 100%; }
	.o-block button { flex: 1; }
	.o-count { display: inline-block; margin-left: 6px; padding: 0 5px; min-width: 18px; font-family: var(--o-mono); font-size: 11px; line-height: 16px; border-radius: 2px; background: var(--o-mark); color: var(--o-mark-ink); }
</style>

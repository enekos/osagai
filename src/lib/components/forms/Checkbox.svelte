<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		checked = $bindable(),
		label,
		hint,
		children,
		class: className = '',
		...rest
	}: Omit<HTMLInputAttributes, 'type' | 'checked'> & { checked?: boolean; label?: string; hint?: string; children?: Snippet } = $props();
</script>

<label class="o-check {className}">
	<input type="checkbox" bind:checked {...rest} />
	<span class="o-text">
		{#if label}{label}{/if}{@render children?.()}
		{#if hint}<span class="o-hint">{hint}</span>{/if}
	</span>
</label>

<style>
	.o-check { display: inline-flex; align-items: flex-start; gap: 8px; font-size: 13px; font-weight: 500; cursor: pointer; margin: 0; color: var(--o-text); }
	input { width: 16px; height: 16px; margin: 1px 0 0; accent-color: var(--o-accent); flex-shrink: 0; cursor: inherit; }
	.o-text { display: inline-flex; flex-direction: column; gap: 1px; }
	.o-hint { font-size: 12px; font-weight: 400; color: var(--o-text-3); }
	.o-check:has(input:disabled) { cursor: not-allowed; opacity: 0.55; }
</style>

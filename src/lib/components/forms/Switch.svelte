<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		checked = $bindable(),
		label,
		class: className = '',
		...rest
	}: Omit<HTMLInputAttributes, 'type' | 'checked'> & { checked?: boolean; label?: string } = $props();
</script>

<label class="o-switch {className}">
	<input type="checkbox" role="switch" bind:checked {...rest} />
	<span class="o-track" aria-hidden="true"><span class="o-thumb"></span></span>
	{#if label}<span>{label}</span>{/if}
</label>

<style>
	.o-switch { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; cursor: pointer; margin: 0; color: var(--o-text); position: relative; }
	input { position: absolute; opacity: 0; width: 1px; height: 1px; margin: 0; }
	.o-track { width: 34px; height: 20px; border: var(--o-line) solid var(--o-border-strong); background: var(--o-surface-2); border-radius: var(--o-radius); position: relative; flex-shrink: 0; transition: background 0.12s; }
	.o-thumb { position: absolute; top: 2px; left: 2px; width: 13px; height: 13px; background: var(--o-ink); transition: transform 0.12s; }
	input:checked + .o-track { background: var(--o-mark); }
	input:checked + .o-track .o-thumb { transform: translateX(14px); background: var(--o-mark-ink); }
	input:focus-visible + .o-track { outline: 2px solid var(--o-accent); outline-offset: 2px; }
	.o-switch:has(input:disabled) { cursor: not-allowed; opacity: 0.55; }
</style>

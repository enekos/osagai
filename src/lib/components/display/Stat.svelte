<script lang="ts">
	import type { Snippet } from 'svelte';
	let { label, value, hint, children }: { label: string; value?: string | number | null; hint?: string; children?: Snippet } = $props();
</script>

<div class="o-stat">
	<div class="o-label">{label}</div>
	<div class="o-value">{#if children}{@render children()}{:else}{value ?? '—'}{/if}</div>
	{#if hint}<div class="o-hint">{hint}</div>{/if}
</div>

<style>
	.o-stat { background: var(--o-surface); border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius-lg); padding: 14px 18px; min-width: 0; }
	.o-label { font-size: 11.5px; color: var(--o-text-3); font-weight: 600; }
	.o-value { font-size: 28px; font-weight: 700; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; line-height: 1.2; margin-top: 2px; }
	.o-hint { font-size: 12px; color: var(--o-text-2); margin-top: 2px; }
</style>

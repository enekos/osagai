<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Icon from '../display/Icon.svelte';

	let {
		tone = 'info',
		title,
		icon = false,
		children,
		class: className = '',
		...rest
	}: Omit<HTMLAttributes<HTMLDivElement>, 'title'> & { tone?: 'neutral' | 'info' | 'ok' | 'warn' | 'error'; title?: string; icon?: boolean; children?: Snippet } = $props();

	const glyph = $derived(tone === 'ok' ? 'check' : tone === 'error' || tone === 'warn' ? 'alert' : 'info');
</script>

<div class="o-notice o-{tone} {className}" role={tone === 'error' ? 'alert' : undefined} {...rest}>
	{#if icon}<span class="o-glyph"><Icon name={glyph} size={15} /></span>{/if}
	<div class="o-body">
		{#if title}<strong class="o-title">{title}</strong>{/if}
		{@render children?.()}
	</div>
</div>

<style>
	.o-notice { display: flex; gap: 10px; align-items: flex-start; padding: 10px 14px; border-radius: var(--o-radius); font-size: 13px; border: var(--o-line) solid var(--o-border-strong); border-left-width: 6px; background: var(--o-surface); color: var(--o-text); }
	.o-error { border-color: var(--o-danger); background: var(--o-danger-soft); }
	.o-ok { border-color: var(--o-ok); background: var(--o-ok-soft); }
	.o-warn { border-color: var(--o-warn); background: var(--o-warn-soft); }
	.o-info { border-color: var(--o-accent); background: var(--o-accent-soft); }
	.o-glyph { display: inline-flex; margin-top: 1px; flex-shrink: 0; }
	.o-error .o-glyph { color: var(--o-danger); }
	.o-ok .o-glyph { color: var(--o-ok); }
	.o-warn .o-glyph { color: var(--o-warn); }
	.o-body { min-width: 0; flex: 1; }
	.o-title { display: block; margin-bottom: 2px; }
</style>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Icon from '../display/Icon.svelte';

	let {
		tone = 'info',
		title,
		icon = true,
		children,
		class: className = '',
		...rest
	}: Omit<HTMLAttributes<HTMLDivElement>, 'title'> & { tone?: 'neutral' | 'info' | 'ok' | 'warn' | 'error'; title?: string; icon?: boolean; children?: Snippet } = $props();

	const glyph = $derived(tone === 'ok' ? 'check' : tone === 'error' || tone === 'warn' ? 'alert' : 'info');
</script>

<div class="o-notice o-{tone} {className}" role={tone === 'error' ? 'alert' : undefined} {...rest}>
	<span class="o-mark" class:o-bare={!icon} aria-hidden="true">{#if icon}<Icon name={glyph} size={14} />{/if}</span>
	<div class="o-body">
		{#if title}<strong class="o-title">{title}</strong>{/if}
		{@render children?.()}
	</div>
</div>

<style>
	.o-notice { --o-tone: var(--o-accent); display: flex; align-items: stretch; min-width: 0; font-size: 13px; line-height: 1.45; color: var(--o-text); background: var(--o-surface); border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius); overflow: hidden; }
	.o-error { --o-tone: var(--o-danger); }
	.o-warn { --o-tone: var(--o-warn); }
	.o-ok { --o-tone: var(--o-ok); }
	.o-neutral { --o-tone: var(--o-text-2); }
	.o-mark { flex: none; display: flex; justify-content: center; align-items: flex-start; width: 30px; padding-top: 10px; background: var(--o-tone); color: var(--o-surface); border-right: var(--o-line) solid var(--o-border-strong); }
	.o-mark.o-bare { width: 6px; padding: 0; }
	.o-body { flex: 1; min-width: 0; padding: 9px 12px; overflow-wrap: anywhere; }
	.o-title { display: block; margin-bottom: 1px; font-weight: 700; }
	.o-body :global(a) { color: inherit; text-decoration: underline; text-underline-offset: 2px; font-weight: 600; }
</style>

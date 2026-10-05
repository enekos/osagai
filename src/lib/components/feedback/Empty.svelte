<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../display/Icon.svelte';
	import type { IconName } from '../../utils/icons.js';

	let { icon = 'info', title, text, compact = false, children }: { icon?: IconName; title: string; text?: string; compact?: boolean; children?: Snippet } = $props();
</script>

<div class="o-empty" class:o-compact={compact}>
	<div class="o-ico"><Icon name={icon} size={compact ? 20 : 26} stroke={1.5} /></div>
	<h3>{title}</h3>
	{#if text}<p>{text}</p>{/if}
	{#if children}<div class="o-actions">{@render children()}</div>{/if}
</div>

<style>
	.o-empty { padding: 44px 20px; text-align: center; color: var(--o-text-2); }
	.o-compact { padding: 22px 16px; }
	.o-ico { width: 52px; height: 52px; border: var(--o-line) solid var(--o-border-strong); display: grid; place-items: center; margin: 0 auto 12px; background: var(--o-mark); color: var(--o-mark-ink); }
	.o-compact .o-ico { width: 40px; height: 40px; margin-bottom: 10px; }
	h3 { margin: 0 0 6px; color: var(--o-text); font-size: 17px; }
	p { max-width: 52ch; margin: 0 auto; }
	.o-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 14px; }
</style>

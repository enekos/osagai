<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Icon from './Icon.svelte';
	import type { IconName } from '../../utils/icons.js';

	let { tone = 'neutral', icon, children, class: className = '', ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: 'neutral' | 'ok' | 'warn' | 'danger' | 'ai' | 'accent'; icon?: IconName; children: Snippet } = $props();
</script>

<span class="o-badge o-{tone} {className}" {...rest}>{#if icon}<Icon name={icon} size={11} />{/if}{@render children()}</span>

<style>
	.o-badge {
		display: inline-flex; align-items: center; gap: 4px; padding: 1px 7px; border-radius: var(--o-radius); font-size: 11.5px; font-weight: 600; white-space: nowrap;
		background: var(--o-surface-2); color: var(--o-text); border: 1px solid var(--o-border-strong); line-height: 1.5; font-family: var(--o-mono); letter-spacing: 0; vertical-align: middle;
	}
	.o-ok { background: var(--o-ok-soft); color: var(--o-ok); border-color: var(--o-ok); }
	.o-warn { background: var(--o-warn-soft); color: var(--o-warn); border-color: var(--o-warn); }
	.o-danger { background: var(--o-danger-soft); color: var(--o-danger); border-color: var(--o-danger); }
	.o-ai { background: var(--o-mark); color: var(--o-mark-ink); border-color: var(--o-mark-ink); }
	.o-accent { background: var(--o-accent-soft); color: var(--o-accent-2); border-color: var(--o-accent); }
</style>

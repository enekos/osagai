<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import Icon from '../display/Icon.svelte';
	import Spinner from '../feedback/Spinner.svelte';
	import type { IconName } from '../../utils/icons.js';

	type Common = {
		variant?: 'default' | 'primary' | 'ai' | 'ghost';
		danger?: boolean;
		size?: 'md' | 'sm';
		icon?: IconName;
		iconRight?: IconName;
		label?: string;
		loading?: boolean;
		flat?: boolean;
		pressed?: boolean;
		block?: boolean;
		children?: Snippet;
	};
	type Props = Common & ((Omit<HTMLButtonAttributes, 'children'> & { href?: undefined }) | (Omit<HTMLAnchorAttributes, 'children'> & { href: string }));

	let {
		variant = 'default',
		danger = false,
		size = 'md',
		icon,
		iconRight,
		label,
		loading = false,
		flat = false,
		pressed,
		block = false,
		children,
		href,
		class: className = '',
		...rest
	}: Props = $props();

	const iconSize = $derived(size === 'sm' ? 14 : 16);
	const square = $derived(!children && !!(icon || loading));
	const classes = $derived(['o-btn', `o-${variant}`, `o-${size}`, danger && 'o-danger', square && 'o-square', flat && 'o-flat', pressed && 'o-pressed', block && 'o-block', className].filter(Boolean).join(' '));
</script>

{#snippet inner()}
	{#if loading}<Spinner size={iconSize - 2} />{:else if icon}<Icon name={icon} size={iconSize} />{/if}
	{#if children}{@render children()}{/if}
	{#if iconRight}<Icon name={iconRight} size={iconSize} />{/if}
{/snippet}

{#if href !== undefined}
	<a {...rest as HTMLAnchorAttributes} class={classes} {href} aria-label={square ? label : undefined} title={square ? label : undefined}>{@render inner()}</a>
{:else}
	{@const attrs = rest as HTMLButtonAttributes}
	<button
		{...attrs}
		class={classes}
		type={attrs.type ?? 'button'}
		disabled={attrs.disabled || loading}
		aria-busy={loading || undefined}
		aria-pressed={pressed}
		aria-label={attrs['aria-label'] ?? (square ? label : undefined)}
		title={attrs.title ?? (square ? label : undefined)}>{@render inner()}</button>
{/if}

<style>
	.o-btn {
		display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 0 14px; height: var(--o-control-h); flex-shrink: 0;
		border-radius: var(--o-radius); border: var(--o-line) solid var(--o-border-strong); background: var(--o-surface); color: var(--o-text);
		font: inherit; font-weight: 600; white-space: nowrap; box-shadow: var(--o-shadow); position: relative; cursor: pointer; text-decoration: none;
		transition: transform 0.06s ease, box-shadow 0.06s ease, background 0.12s;
	}
	.o-btn:hover { background: var(--o-surface-2); text-decoration: none; }
	.o-btn:active:not(:disabled) { transform: translate(3px, 3px); box-shadow: 0 0 0 var(--o-ink); }
	.o-btn:disabled { cursor: not-allowed; opacity: 0.45; }
	.o-primary { background: var(--o-accent); color: var(--o-accent-ink); }
	.o-primary:hover { background: var(--o-accent-2); }
	.o-ai { background: var(--o-mark); color: var(--o-mark-ink); border-color: var(--o-mark-ink); }
	.o-ai:hover { background: var(--o-mark-soft); }
	.o-danger { color: var(--o-danger); }
	.o-danger:hover { background: var(--o-danger-soft); }
	.o-primary.o-danger { background: var(--o-danger); color: #fff; }
	.o-primary.o-danger:hover { background: var(--o-danger); filter: brightness(1.1); }
	.o-ghost { border-color: transparent; background: transparent; box-shadow: none; }
	.o-ghost:hover { background: var(--o-surface-3); }
	.o-ghost:active:not(:disabled) { transform: none; }
	.o-ghost.o-pressed { background: var(--o-ink); color: var(--o-surface); }
	.o-pressed:not(.o-ghost) { background: var(--o-mark); color: var(--o-mark-ink); }
	.o-sm { height: var(--o-control-h-sm); padding: 0 10px; font-size: 12.5px; gap: 5px; box-shadow: var(--o-shadow-sm); }
	.o-sm:active:not(:disabled) { transform: translate(2px, 2px); }
	.o-sm.o-ghost, .o-flat { box-shadow: none; }
	.o-flat:active:not(:disabled) { transform: none; }
	.o-square { width: var(--o-control-h); padding: 0; }
	.o-square.o-sm { width: var(--o-control-h-sm); }
	.o-block { width: 100%; }
</style>

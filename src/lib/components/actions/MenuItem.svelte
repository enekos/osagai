<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../display/Icon.svelte';
	import type { IconName } from '../../utils/icons.js';
	import { getMenuClose } from '../../context/menu.js';

	let {
		icon,
		danger = false,
		checked,
		disabled = false,
		href,
		hint,
		onclick,
		children
	}: { icon?: IconName; danger?: boolean; checked?: boolean; disabled?: boolean; href?: string; hint?: string; onclick?: (e: MouseEvent) => void; children: Snippet } = $props();

	const close = getMenuClose();
	function click(e: MouseEvent) {
		onclick?.(e);
		close?.();
	}
</script>

{#snippet body()}
	{#if icon}<Icon name={icon} size={14} />{/if}
	<span class="o-text">{@render children()}</span>
	{#if hint}<span class="o-hint">{hint}</span>{/if}
	{#if checked}<Icon name="check" size={14} />{/if}
{/snippet}

{#if href}
	<a class="o-item" class:o-danger={danger} role="menuitem" {href} onclick={click}>{@render body()}</a>
{:else}
	<button type="button" class="o-item" class:o-danger={danger} role="menuitem" {disabled} onclick={click}>{@render body()}</button>
{/if}

<style>
	.o-item { display: flex; width: 100%; align-items: center; gap: 8px; padding: 7px 10px; border: none; background: none; border-radius: 2px; text-align: left; font: inherit; font-weight: 500; color: var(--o-text); cursor: pointer; white-space: nowrap; }
	.o-item:hover, .o-item:focus-visible { background: var(--o-ink); color: var(--o-surface); text-decoration: none; outline: none; }
	.o-item:disabled { opacity: 0.45; cursor: not-allowed; background: none; color: var(--o-text); }
	.o-danger { color: var(--o-danger); }
	.o-danger:hover, .o-danger:focus-visible { background: var(--o-danger); color: #fff; }
	.o-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
	.o-hint { font-size: 11.5px; opacity: 0.6; font-family: var(--o-mono); }
</style>

<script lang="ts">
	import Avatar from './Avatar.svelte';

	let { names, max = 4, size = 'md', label }: { names: readonly string[]; max?: number; size?: 'sm' | 'md'; label?: string } = $props();

	const shown = $derived(names.length > max ? names.slice(0, Math.max(1, max - 1)) : names);
	const rest = $derived(names.slice(shown.length));
</script>

<span class="o-avatar-group o-{size}" role="img" aria-label={label ?? names.join(', ')}>
	{#each shown as name, i (i)}<Avatar {name} {size} />{/each}
	{#if rest.length}<span class="o-more" title={rest.join(', ')}>+{rest.length}</span>{/if}
</span>

<style>
	.o-avatar-group { display: inline-flex; align-items: center; }
	.o-avatar-group > :global(*) { box-shadow: 0 0 0 var(--o-line) var(--o-surface); }
	.o-avatar-group > :global(* + *) { margin-left: -6px; }
	.o-sm > :global(* + *) { margin-left: -4px; }
	.o-more { display: inline-grid; place-items: center; min-width: 26px; height: 26px; padding: 0 4px; border-radius: 2px; background: var(--o-surface-2); color: var(--o-text); border: 1px solid var(--o-border-strong); font-family: var(--o-mono); font-size: 11px; font-weight: 700; }
	.o-sm .o-more { min-width: 18px; height: 18px; font-size: 9.5px; padding: 0 2px; }
</style>

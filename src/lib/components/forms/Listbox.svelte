<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	const uid = $props.id();

	let {
		items,
		active = $bindable(0),
		id = `o-lb-${uid}`,
		label,
		onpick,
		item,
		empty,
		class: className = ''
	}: {
		items: readonly T[];
		active?: number;
		id?: string;
		label?: string;
		onpick: (item: T, index: number) => void;
		item: Snippet<[T, { index: number; active: boolean }]>;
		empty?: Snippet;
		class?: string;
	} = $props();

	let list: HTMLUListElement | undefined = $state();

	$effect(() => {
		list?.children.item(active)?.scrollIntoView?.({ block: 'nearest' });
	});
</script>

<ul {id} bind:this={list} class="o-listbox {className}" role="listbox" aria-label={label}>
	{#each items as it, i}
		<li
			id="{id}-{i}"
			class="o-option"
			class:o-active={i === active}
			role="option"
			aria-selected={i === active}
			onmousedown={(e) => {
				e.preventDefault();
				onpick(it, i);
			}}
			onmouseenter={() => (active = i)}>
			{@render item(it, { index: i, active: i === active })}
		</li>
	{:else}
		{#if empty}<li class="o-listbox-empty" role="presentation">{@render empty()}</li>{/if}
	{/each}
</ul>

<style>
	.o-listbox { list-style: none; margin: 0; padding: 4px; overflow: auto; max-height: min(280px, var(--o-anchor-room, 280px)); }
	.o-option { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border: 1px solid transparent; border-radius: calc(var(--o-radius) - 2px); cursor: pointer; font-size: 13px; color: var(--o-text); }
	.o-active { background: var(--o-surface-2); border-color: var(--o-border-strong); }
	.o-listbox-empty { padding: 6px 8px; font-size: 12.5px; color: var(--o-text-3); }
</style>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../display/Icon.svelte';
	import { getAccordion } from '../../context/accordion.js';

	const uid = $props.id();

	let {
		open = $bindable(false),
		title,
		hint,
		disabled = false,
		ontoggle,
		aside,
		children
	}: {
		open?: boolean;
		title: string | Snippet;
		hint?: string;
		disabled?: boolean;
		ontoggle?: (open: boolean) => void;
		aside?: Snippet;
		children: Snippet;
	} = $props();

	const id = `o-collapsible-${uid}`;
	const group = getAccordion();
	group?.register(id, open);
	const expanded = $derived(group ? group.isOpen(id) : open);

	$effect(() => {
		if (group) open = expanded;
	});

	function toggle() {
		const next = !expanded;
		if (group) group.toggle(id, next);
		else open = next;
		ontoggle?.(next);
	}
</script>

<div class="o-collapsible" class:o-open={expanded}>
	<button type="button" class="o-collapsible-head" id="{id}-head" aria-expanded={expanded} aria-controls="{id}-panel" {disabled} onclick={toggle}>
		<span class="o-chev" aria-hidden="true"><Icon name="chevron" size={12} /></span>
		<span class="o-title">{#if typeof title === 'string'}{title}{:else}{@render title()}{/if}</span>
		{#if hint}<span class="o-hint">{hint}</span>{/if}
	</button>
	{#if aside}<div class="o-aside">{@render aside()}</div>{/if}
	<div class="o-collapsible-panel" id="{id}-panel" role="region" aria-labelledby="{id}-head" inert={!expanded}>
		<div class="o-collapsible-inner"><div class="o-collapsible-body">{@render children()}</div></div>
	</div>
</div>

<style>
	.o-collapsible { display: grid; grid-template-columns: 1fr auto; align-items: center; min-width: 0; }
	.o-collapsible-head { display: flex; align-items: center; gap: 8px; min-width: 0; padding: 6px 0; border: none; background: none; color: var(--o-text); font: inherit; font-weight: 700; text-align: left; cursor: pointer; }
	.o-collapsible-head:hover .o-title { text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 2px; }
	.o-chev { display: inline-grid; place-items: center; flex: none; transition: transform var(--o-duration) var(--o-ease-out); }
	.o-open .o-chev { transform: rotate(90deg); }
	.o-title { min-width: 0; overflow-wrap: anywhere; }
	.o-hint { margin-left: auto; padding-left: 8px; font-weight: 400; font-size: 12.5px; color: var(--o-text-3); white-space: nowrap; }
	.o-aside { display: flex; gap: 6px; align-items: center; padding-left: 8px; }
	.o-collapsible-panel { grid-column: 1 / -1; display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--o-duration-slow) var(--o-ease-out); }
	.o-open > .o-collapsible-panel { grid-template-rows: 1fr; }
	.o-collapsible-inner { min-height: 0; overflow: hidden; }
	.o-collapsible-body { padding: 4px 0 10px 20px; }
</style>

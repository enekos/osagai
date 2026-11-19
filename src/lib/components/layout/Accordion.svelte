<script lang="ts">
	import type { Snippet } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { setAccordion } from '../../context/accordion.js';

	let { multiple = false, framed = true, children }: { multiple?: boolean; framed?: boolean; children: Snippet } = $props();

	const opened = new SvelteSet<string>();
	let root: HTMLDivElement | undefined = $state();

	setAccordion({
		isOpen: (id) => opened.has(id),
		toggle(id, open) {
			if (!open) {
				opened.delete(id);
				return;
			}
			if (!multiple) opened.clear();
			opened.add(id);
		},
		register(id, open) {
			if (!open || (!multiple && opened.size)) return;
			opened.add(id);
		}
	});

	function onkeydown(e: KeyboardEvent) {
		if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
		// Not `:scope > .o-collapsible > …`: items may be wrapped (li, grid cells) and arrow nav must still work.
		const heads = root ? [...root.querySelectorAll<HTMLButtonElement>('.o-collapsible-head:not(:disabled)')] : [];
		const at = heads.indexOf(document.activeElement as HTMLButtonElement);
		if (at < 0) return;
		e.preventDefault();
		const next = e.key === 'Home' ? 0 : e.key === 'End' ? heads.length - 1 : e.key === 'ArrowDown' ? (at + 1) % heads.length : (at - 1 + heads.length) % heads.length;
		heads[next]?.focus();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="o-accordion" class:o-framed={framed} bind:this={root} {onkeydown}>
	{@render children()}
</div>

<style>
	.o-accordion { display: flex; flex-direction: column; min-width: 0; }
	.o-framed { border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius); background: var(--o-surface); overflow: hidden; }
	.o-framed > :global(.o-collapsible + .o-collapsible) { border-top: var(--o-line) solid var(--o-border-strong); }
	.o-framed > :global(.o-collapsible > .o-collapsible-head) { padding: 10px 14px; }
	.o-framed > :global(.o-collapsible > .o-collapsible-panel > .o-collapsible-body) { padding: 0 14px 14px 34px; }
	.o-framed > :global(.o-collapsible > .o-aside) { padding-right: 14px; }
</style>

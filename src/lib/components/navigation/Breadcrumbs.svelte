<script lang="ts" module>
	export interface Crumb {
		label: string;
		href?: string;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		items,
		separator = '/',
		label = 'Breadcrumb',
		mono = false,
		root
	}: {
		items: Crumb[];
		separator?: string;
		label?: string;
		mono?: boolean;
		/** rendered before the first item, e.g. a home icon link */
		root?: Snippet;
	} = $props();
</script>

<nav class="o-crumbs" class:o-mono={mono} aria-label={label}>
	<ol>
		{#if root}<li class="o-root">{@render root()}</li>{/if}
		{#each items as item, i (i)}
			{@const last = i === items.length - 1}
			<li>
				{#if i > 0 || root}<span class="o-sep" aria-hidden="true">{separator}</span>{/if}
				{#if item.href && !last}
					<a href={item.href}>{item.label}</a>
				{:else}
					<span class:o-current={last} aria-current={last ? 'page' : undefined}>{item.label}</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	/* margins instead of flex gap, so it lays out on Safari < 14.1 too */
	.o-crumbs { min-width: 0; }
	ol { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; align-items: baseline; }
	li { display: inline-flex; align-items: baseline; min-width: 0; max-width: 100%; }
	.o-mono { font-family: var(--o-mono); }
	a, .o-current, li > span:not(.o-sep) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 2px 0; }
	a { color: var(--o-text-2); text-decoration: none; }
	a:hover { color: var(--o-text); text-decoration: underline; text-decoration-thickness: var(--o-line); text-underline-offset: 3px; }
	.o-current { color: var(--o-text); font-weight: 700; }
	.o-sep { color: var(--o-text-3); margin: 0 0.4em; }
	.o-root { color: var(--o-text); }
</style>

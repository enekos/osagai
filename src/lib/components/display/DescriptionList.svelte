<script lang="ts" module>
	export interface DescriptionItem {
		term: string;
		value?: string | number | null;
		key?: string;
		mono?: boolean;
		hint?: string;
	}
</script>

<script lang="ts" generics="T extends DescriptionItem">
	import type { Snippet } from 'svelte';

	let {
		items,
		layout = 'inline',
		termWidth = '160px',
		empty = '—',
		value
	}: {
		items: readonly T[];
		layout?: 'inline' | 'stacked';
		termWidth?: string;
		empty?: string;
		value?: Snippet<[T]>;
	} = $props();

	const blank = (item: T) => !value && (item.value === undefined || item.value === null || item.value === '');
</script>

<dl class="o-dl o-{layout}" style:--o-dl-term={termWidth}>
	{#each items as item, i (item.key ?? `${item.term}-${i}`)}
		<div class="o-dl-row">
			<dt>{item.term}{#if item.hint}<span class="o-dl-hint">{item.hint}</span>{/if}</dt>
			<dd class:o-mono={item.mono} class:o-empty={blank(item)}>
				{#if value}{@render value(item)}{:else if blank(item)}{empty}{:else}{item.value}{/if}
			</dd>
		</div>
	{/each}
</dl>

<style>
	.o-dl { margin: 0; display: flex; flex-direction: column; min-width: 0; }
	.o-dl-row { min-width: 0; }
	dt { font-size: 12.5px; font-weight: 600; color: var(--o-text-2); }
	dd { margin: 0; min-width: 0; overflow-wrap: anywhere; color: var(--o-text); }
	.o-dl-hint { display: block; font-weight: 400; color: var(--o-text-3); font-size: 11.5px; }
	.o-mono { font-family: var(--o-mono); font-size: 12.5px; }
	.o-empty { color: var(--o-text-3); }
	.o-inline .o-dl-row { display: grid; grid-template-columns: var(--o-dl-term) minmax(0, 1fr); gap: 12px; padding: 7px 0; border-bottom: 1px solid var(--o-border); }
	.o-inline .o-dl-row:last-child { border-bottom: none; }
	.o-stacked { gap: 12px; }
	.o-stacked dt { margin-bottom: 2px; }
	@media (max-width: 760px) {
		.o-inline .o-dl-row { grid-template-columns: minmax(0, 1fr); gap: 2px; }
	}
</style>

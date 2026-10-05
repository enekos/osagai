<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../display/Icon.svelte';
	import type { IconName } from '../../utils/icons.js';

	let {
		title,
		icon,
		description,
		href,
		onclick,
		dashed = false,
		accent,
		aside,
		children
	}: {
		title: string;
		icon?: IconName;
		description?: string;
		href?: string;
		onclick?: (e: MouseEvent) => void;
		dashed?: boolean;
		accent?: 'ok' | 'accent' | 'danger';
		aside?: Snippet;
		children?: Snippet;
	} = $props();
</script>

<div class="o-tile" class:o-live={href || onclick} class:o-dashed={dashed} data-accent={accent}>
	<div class="o-head">
		{#if href}
			<a class="o-title o-stretch" {href}>{#if icon}<Icon name={icon} size={14} />{/if}{title}</a>
		{:else if onclick}
			<button type="button" class="o-title o-stretch" {onclick}>{#if icon}<Icon name={icon} size={14} />{/if}{title}</button>
		{:else}
			<strong class="o-title">{#if icon}<Icon name={icon} size={14} />{/if}{title}</strong>
		{/if}
		{#if aside}<span class="o-aside">{@render aside()}</span>{/if}
	</div>
	{#if description}<p>{description}</p>{/if}
	{#if children}<div class="o-meta">{@render children()}</div>{/if}
</div>

<style>
	.o-tile { position: relative; display: flex; flex-direction: column; gap: 6px; min-width: 0; padding: 16px 18px; text-align: left; font: inherit; color: var(--o-text); background: var(--o-surface); border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius-lg); transition: transform 0.06s ease, box-shadow 0.06s ease; }
	.o-live:hover { box-shadow: var(--o-shadow); transform: translate(-1px, -1px); }
	.o-live:has(.o-stretch:focus-visible) { outline: 2px solid var(--o-accent); outline-offset: 2px; }
	.o-dashed { border-style: dashed; }
	[data-accent='ok'] { border-left: 6px solid var(--o-ok); }
	[data-accent='accent'] { border-left: 6px solid var(--o-accent); }
	[data-accent='danger'] { border-left: 6px solid var(--o-danger); }
	.o-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
	.o-title { display: inline-flex; gap: 6px; align-items: center; min-width: 0; font: inherit; font-weight: 700; color: var(--o-text); background: none; border: none; padding: 0; text-align: left; cursor: pointer; }
	.o-title:hover { text-decoration: none; }
	.o-stretch { outline: none; }
	.o-stretch::after { content: ''; position: absolute; inset: 0; }
	.o-aside { position: relative; z-index: 1; flex-shrink: 0; display: inline-flex; gap: 6px; align-items: center; }
	p { margin: 0; font-size: 12.5px; color: var(--o-text-2); }
	.o-meta { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; font-size: 11.5px; color: var(--o-text-3); }
</style>

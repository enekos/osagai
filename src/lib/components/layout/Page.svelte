<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../display/Icon.svelte';

	let {
		title,
		description,
		eyebrow,
		back,
		actions,
		width = '1440px',
		children
	}: {
		title?: string | Snippet;
		description?: string | Snippet;
		eyebrow?: Snippet;
		back?: { href: string; label: string };
		actions?: Snippet;
		width?: string;
		children: Snippet;
	} = $props();
</script>

<div class="o-page" style:max-width={width}>
	{#if title || actions}
		<header>
			<div class="o-titles">
				{#if back}<a class="o-back" href={back.href}><Icon name="arrow-left" size={12} /> {back.label}</a>{/if}
				{#if eyebrow}<div class="o-eyebrow">{@render eyebrow()}</div>{/if}
				{#if typeof title === 'string'}<h1>{title}</h1>{:else if title}{@render title()}{/if}
				{#if typeof description === 'string'}<p>{description}</p>{:else if description}<div class="o-desc">{@render description()}</div>{/if}
			</div>
			{#if actions}<div class="o-actions">{@render actions()}</div>{/if}
		</header>
	{/if}
	{@render children()}
</div>

<style>
	.o-page { padding: 26px 32px 60px; }
	header { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 22px; padding-bottom: 16px; border-bottom: var(--o-line) solid var(--o-border-strong); }
	.o-titles { min-width: 0; }
	.o-back { display: inline-flex; align-items: center; gap: 4px; font-size: 12.5px; color: var(--o-text-2); margin-bottom: 6px; }
	.o-back:hover { color: var(--o-text); }
	.o-eyebrow { font-size: 12px; font-weight: 600; color: var(--o-text-2); margin-bottom: 6px; }
	p, .o-desc { color: var(--o-text-2); margin-top: 6px; max-width: 70ch; }
	.o-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
	@media (max-width: 760px) {
		.o-page { padding: 16px 16px 48px; }
		header { flex-direction: column; align-items: stretch; gap: 12px; }
		.o-actions { justify-content: flex-start; }
	}
</style>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		title,
		description,
		actions,
		padding = 'md',
		tone = 'default',
		children,
		class: className = '',
		...rest
	}: Omit<HTMLAttributes<HTMLElement>, 'title'> & {
		title?: string | Snippet;
		description?: string;
		actions?: Snippet;
		padding?: 'none' | 'sm' | 'md';
		tone?: 'default' | 'soft' | 'danger' | 'accent';
		children?: Snippet;
	} = $props();
</script>

<section class="o-card o-pad-{padding} o-tone-{tone} {className}" {...rest}>
	{#if title || actions}
		<header class:o-flush={padding === 'none'}>
			<div class="o-titles">
				{#if typeof title === 'string'}<h2>{title}</h2>{:else if title}{@render title()}{/if}
				{#if description}<p>{description}</p>{/if}
			</div>
			{#if actions}<div class="o-actions">{@render actions()}</div>{/if}
		</header>
	{/if}
	{@render children?.()}
</section>

<style>
	.o-card { background: var(--o-surface); border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius-lg); min-width: 0; }
	.o-pad-md { padding: 18px; }
	.o-pad-sm { padding: 12px; }
	.o-pad-none { padding: 0; overflow: auto; }
	.o-tone-soft { border-color: var(--o-border); }
	.o-tone-danger { border-color: var(--o-danger); }
	.o-tone-danger h2 { color: var(--o-danger); }
	.o-tone-accent { border-color: var(--o-accent); background: var(--o-accent-soft); }
	header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
	header.o-flush { margin: 0; padding: 12px 14px; border-bottom: var(--o-line) solid var(--o-border-strong); }
	.o-titles { min-width: 0; }
	h2 { font-size: 18px; }
	p { margin-top: 4px; font-size: 12.5px; color: var(--o-text-2); }
	.o-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
</style>

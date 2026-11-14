<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		html,
		serif = false,
		size = 'md',
		children
	}: {
		/** trusted HTML, e.g. rendered and sanitised markdown */
		html?: string;
		/** set body text in a book face — kinder for long reads and e-ink */
		serif?: boolean;
		size?: 'sm' | 'md' | 'lg';
		children?: Snippet;
	} = $props();
</script>

<div class="o-prose o-{size}" class:o-serif={serif}>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- `html` is documented as trusted, sanitised by the caller -->
	{#if html !== undefined}{@html html}{:else if children}{@render children()}{/if}
</div>

<style>
	.o-prose { font-size: 15px; line-height: 1.6; color: var(--o-text); overflow-wrap: break-word; max-width: 72ch; }
	.o-sm { font-size: 13.5px; }
	.o-lg { font-size: 17px; }
	.o-serif { font-family: Charter, 'Bitstream Charter', 'Iowan Old Style', Georgia, Cambria, serif; line-height: 1.55; }
	.o-prose > :global(:first-child) { margin-top: 0; }
	.o-prose > :global(:last-child) { margin-bottom: 0; }
	.o-prose :global(p), .o-prose :global(ul), .o-prose :global(ol), .o-prose :global(blockquote), .o-prose :global(table), .o-prose :global(pre), .o-prose :global(details), .o-prose :global(dl) { margin: 0 0 1em; }
	.o-prose :global(h1), .o-prose :global(h2), .o-prose :global(h3), .o-prose :global(h4), .o-prose :global(h5), .o-prose :global(h6) { font-family: var(--o-font); font-weight: 700; letter-spacing: -0.02em; line-height: 1.2; margin: 1.6em 0 0.5em; position: relative; }
	.o-prose :global(h1) { font-size: 1.9em; letter-spacing: -0.03em; padding-bottom: 0.25em; border-bottom: var(--o-line) solid var(--o-border-strong); }
	.o-prose :global(h2) { font-size: 1.4em; padding-bottom: 0.2em; border-bottom: 1px solid var(--o-border); }
	.o-prose :global(h3) { font-size: 1.15em; }
	.o-prose :global(h4), .o-prose :global(h5), .o-prose :global(h6) { font-size: 1em; }
	.o-prose :global(.anchor) { position: absolute; left: -0.9em; width: 0.9em; color: var(--o-text-3); text-decoration: none; opacity: 0; }
	.o-prose :global(h1:hover .anchor), .o-prose :global(h2:hover .anchor), .o-prose :global(h3:hover .anchor), .o-prose :global(.anchor:focus) { opacity: 1; }
	.o-prose :global(a) { color: var(--o-text); text-decoration: underline; text-decoration-color: var(--o-accent); text-decoration-thickness: var(--o-line); text-underline-offset: 3px; }
	.o-prose :global(a:hover) { background: var(--o-accent-soft); }
	.o-prose :global(ul), .o-prose :global(ol) { padding-left: 1.5em; }
	.o-prose :global(li + li) { margin-top: 0.25em; }
	.o-prose :global(li > ul), .o-prose :global(li > ol) { margin: 0.25em 0 0; }
	.o-prose :global(blockquote) { padding: 0.1em 0 0.1em 1em; border-left: 3px solid var(--o-border-strong); color: var(--o-text-2); }
	.o-prose :global(code) { font-family: var(--o-mono); font-size: 0.86em; background: var(--o-surface-2); border: 1px solid var(--o-border); padding: 0.05em 0.3em; }
	.o-prose :global(pre) { font-family: var(--o-mono); font-size: 13px; line-height: 1.55; padding: 12px 14px; background: var(--o-surface-2); border: var(--o-line) solid var(--o-border-strong); overflow-x: auto; white-space: pre; -webkit-overflow-scrolling: touch; }
	.o-prose :global(pre code) { background: none; border: 0; padding: 0; font-size: inherit; }
	.o-prose :global(pre .c) { color: var(--o-text-3); font-style: italic; }
	.o-prose :global(pre .s) { color: var(--o-text-2); }
	.o-prose :global(pre .k) { font-weight: 700; }
	.o-prose :global(img) { max-width: 100%; height: auto; vertical-align: middle; }
	.o-prose :global(hr) { border: 0; border-top: var(--o-line) solid var(--o-border-strong); margin: 2em 0; }
	.o-prose :global(table) { border-collapse: collapse; display: block; overflow-x: auto; max-width: 100%; font-size: 0.93em; }
	.o-prose :global(th), .o-prose :global(td) { border: 1px solid var(--o-border-strong); padding: 6px 10px; text-align: left; vertical-align: top; }
	.o-prose :global(th) { background: var(--o-surface-2); font-family: var(--o-font); }
	.o-prose :global(details) { border: 1px solid var(--o-border); padding: 0.5em 0.8em; }
	.o-prose :global(summary) { cursor: pointer; font-weight: 600; }
	.o-prose :global(input[type='checkbox']) { margin-right: 0.4em; }
	.o-prose :global(kbd) { font-family: var(--o-mono); font-size: 0.85em; border: 1px solid var(--o-border-strong); border-bottom-width: 2px; padding: 0 0.3em; }
</style>

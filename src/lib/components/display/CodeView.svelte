<script lang="ts">
	let {
		text,
		lines: html,
		start = 1,
		numbers = true,
		wrap = true,
		anchor = 'L',
		label = 'Code'
	}: {
		/** plain source; escaped for you */
		text?: string;
		/**
		 * one HTML string per line, already escaped — the output of a
		 * highlighter. Spans with class `c`, `s` and `k` are set as comment,
		 * string and keyword.
		 */
		lines?: string[];
		start?: number;
		numbers?: boolean;
		/** soft-wrap long lines instead of scrolling sideways */
		wrap?: boolean;
		/** line id prefix: lines get id `${anchor}${n}`, so #L12 links work; '' for none */
		anchor?: string;
		label?: string;
	} = $props();

	const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

	const rows = $derived(html ?? (text ?? '').replace(/\r\n?/g, '\n').replace(/\n$/, '').split('\n').map(esc));

	// One string, one {@html}: a 3000-line file is one DOM write, not 3000 components.
	const body = $derived.by(() => {
		let out = '';
		for (let i = 0; i < rows.length; i++) {
			const n = start + i;
			const id = anchor ? ` id="${anchor}${n}"` : '';
			const num = numbers ? (anchor ? `<a class="o-ln" href="#${anchor}${n}" aria-hidden="true" tabindex="-1">${n}</a>` : `<span class="o-ln" aria-hidden="true">${n}</span>`) : '';
			out += `<span class="o-row"${id}>${num}<span class="o-src">${rows[i] || ' '}</span></span>`;
		}
		return out;
	});
	const digits = $derived(String(start + rows.length).length);
</script>

<!-- role=group exposes the label; tabindex makes the scroll region keyboard-scrollable when not wrapping -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- eslint-disable-next-line svelte/no-at-html-tags -- `lines` is documented as pre-escaped HTML; `text` is escaped above -->
<pre class="o-code" class:o-wrap={wrap} class:o-numbers={numbers} style:--o-digits={digits} role="group" aria-label={label} tabindex={wrap ? undefined : 0}><code>{@html body}</code></pre>

<style>
	.o-code { margin: 0; padding: 10px 0; font-family: var(--o-mono); font-size: 13px; line-height: 1.6; color: var(--o-text); background: var(--o-surface); border: var(--o-line) solid var(--o-border-strong); overflow-x: auto; -webkit-overflow-scrolling: touch; tab-size: 4; -moz-tab-size: 4; white-space: pre; word-break: normal; }
	.o-code code { font: inherit; background: none; border: 0; padding: 0; }
	.o-code :global(.o-row) { display: block; position: relative; padding: 0 14px; min-height: 1.6em; }
	.o-numbers :global(.o-row) { padding-left: calc(var(--o-digits, 3) * 1ch + 30px); }
	.o-wrap { white-space: pre-wrap; overflow-wrap: anywhere; word-break: break-word; }
	.o-code :global(.o-ln) { position: absolute; left: 0; width: calc(var(--o-digits, 3) * 1ch + 16px); padding-right: 10px; text-align: right; color: var(--o-text-3); text-decoration: none; -webkit-user-select: none; user-select: none; }
	.o-code :global(.o-ln:hover) { color: var(--o-text); text-decoration: underline; }
	.o-code :global(.o-row:target) { background: var(--o-mark-soft); }
	.o-code :global(.o-row:target .o-ln) { color: var(--o-mark-ink); font-weight: 700; }
	/* typographic tokens: legible in greyscale, no palette to maintain */
	.o-code :global(.c) { color: var(--o-text-3); font-style: italic; }
	.o-code :global(.s) { color: var(--o-text-2); }
	.o-code :global(.k) { font-weight: 700; }
</style>

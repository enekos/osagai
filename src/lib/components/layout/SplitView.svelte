<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		aside,
		placement = 'end',
		asideWidth = '320px',
		gap = '24px',
		sticky = false,
		children
	}: {
		aside: Snippet;
		placement?: 'start' | 'end';
		asideWidth?: string;
		gap?: string;
		sticky?: boolean;
		children: Snippet;
	} = $props();
</script>

<div class="o-split o-{placement}" class:o-sticky={sticky} style:--o-split-aside={asideWidth} style:--o-split-gap={gap}>
	<div class="o-split-main">{@render children()}</div>
	<aside class="o-split-aside">{@render aside()}</aside>
</div>

<style>
	.o-split { display: grid; gap: var(--o-split-gap); align-items: start; min-width: 0; }
	.o-end { grid-template-columns: minmax(0, 1fr) var(--o-split-aside); }
	.o-start { grid-template-columns: var(--o-split-aside) minmax(0, 1fr); }
	.o-start .o-split-aside { grid-row: 1; grid-column: 1; }
	.o-split-main, .o-split-aside { min-width: 0; }
	.o-sticky .o-split-aside { position: sticky; top: 16px; }
	@media (max-width: 760px) {
		.o-split { grid-template-columns: minmax(0, 1fr); }
		.o-start .o-split-aside { grid-row: auto; grid-column: auto; }
		.o-sticky .o-split-aside { position: static; }
	}
</style>

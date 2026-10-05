<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	let { name, size = 'md', class: className = '', ...rest }: HTMLAttributes<HTMLSpanElement> & { name: string; size?: 'sm' | 'md' } = $props();
	const letter = $derived((name.trim()[0] ?? '?').toUpperCase());
</script>

<span class="o-avatar o-{size} {className}" title={name} aria-hidden="true" {...rest}>{letter}</span>

<style>
	.o-avatar { border-radius: 2px; background: var(--o-mark); color: var(--o-mark-ink); display: inline-grid; place-items: center; font-weight: 700; flex-shrink: 0; font-family: var(--o-mono); }
	.o-md { width: 26px; height: 26px; font-size: 13px; }
	.o-sm { width: 18px; height: 18px; font-size: 10px; }
</style>

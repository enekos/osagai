<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	let { name, size = 'md', class: className = '', ...rest }: HTMLAttributes<HTMLSpanElement> & { name: string; size?: 'sm' | 'md' } = $props();
	const letter = $derived((name.trim().charAt(0) || '?').toUpperCase());
</script>

<!-- Announced as the person's name by default; pass aria-hidden when adjacent text already names them. -->
<span class="o-avatar o-{size} {className}" title={name} role="img" aria-label={name} {...rest}>{letter}</span>

<style>
	.o-avatar { border-radius: 2px; background: var(--o-mark); color: var(--o-mark-ink); display: inline-grid; place-items: center; font-weight: 700; flex-shrink: 0; font-family: var(--o-mono); }
	.o-md { width: 26px; height: 26px; font-size: 13px; }
	.o-sm { width: 18px; height: 18px; font-size: 10px; }
</style>

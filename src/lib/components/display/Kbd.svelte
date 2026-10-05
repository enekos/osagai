<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<kbd>{@render children()}</kbd>

<style>
	kbd { font-family: var(--o-mono); font-size: 11px; padding: 1px 5px; border: 1px solid var(--o-border-strong); border-bottom-width: 2px; border-radius: 2px; color: var(--o-text); background: var(--o-surface); }
</style>

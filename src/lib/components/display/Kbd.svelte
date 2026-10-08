<script lang="ts">
	import type { Snippet } from 'svelte';
	import { formatKeys } from '../../utils/keys.js';
	let { keys, children }: { keys?: string; children?: Snippet } = $props();
</script>

<kbd>{#if keys}{formatKeys(keys)}{:else}{@render children?.()}{/if}</kbd>

<style>
	kbd { font-family: var(--o-mono); font-size: 11px; padding: 1px 5px; border: 1px solid var(--o-border-strong); border-bottom-width: 2px; border-radius: 2px; color: var(--o-text); background: var(--o-surface); }
</style>

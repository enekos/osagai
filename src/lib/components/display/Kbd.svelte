<script lang="ts">
	import type { Snippet } from 'svelte';
	import { formatKeys, spokenKeys } from '../../utils/keys.js';
	let { keys, children }: { keys?: string; children?: Snippet } = $props();
</script>

<kbd>{#if keys}<span aria-hidden="true">{formatKeys(keys)}</span><span class="o-spoken">{spokenKeys(keys)}</span>{:else}{@render children?.()}{/if}</kbd>

<style>
	kbd { font-family: var(--o-mono); font-size: 11px; padding: 1px 5px; border: 1px solid var(--o-border-strong); border-bottom-width: 2px; border-radius: 2px; color: var(--o-text); background: var(--o-surface); white-space: nowrap; }
	.o-spoken { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
</style>

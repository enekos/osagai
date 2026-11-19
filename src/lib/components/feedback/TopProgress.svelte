<script lang="ts">
	let { active, delay = 150 }: { active: boolean; delay?: number } = $props();

	let shown = $state(false);

	$effect(() => {
		if (!active) {
			shown = false;
			return;
		}
		const timer = setTimeout(() => (shown = true), delay);
		return () => clearTimeout(timer);
	});
</script>

{#if shown}
	<span class="o-top-progress" aria-hidden="true"><span class="o-bar"></span></span>
	<span class="o-sr" role="status">Loading</span>
{/if}

<style>
	.o-top-progress { position: fixed; top: 0; left: 0; right: 0; z-index: 70; height: 3px; overflow: hidden; pointer-events: none; }
	.o-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; border: 0; }
	.o-bar { position: absolute; top: 0; bottom: 0; left: 0; width: 40%; background: var(--o-accent); animation: o-top-progress 1.1s var(--o-ease-out) infinite; }
	@keyframes o-top-progress { from { transform: translateX(-100%); } to { transform: translateX(260%); } }
	@media (prefers-reduced-motion: reduce) { .o-bar { width: 100%; opacity: 0.6; animation: none; } }
</style>

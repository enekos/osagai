<script lang="ts">
	let { size = 16, label = 'Loading' }: { size?: number; label?: string } = $props();
</script>

<span class="o-spinner" style:width="{size}px" style:height="{size}px" role="status" aria-label={label}></span>

<style>
	.o-spinner { display: inline-block; flex-shrink: 0; border: 2px solid var(--o-border); border-top-color: currentColor; border-radius: 50%; animation: o-spin 0.7s linear infinite; }
	@keyframes o-spin { to { transform: rotate(360deg); } }
</style>

<script lang="ts">
	let { height = '120px', width = '100%' }: { height?: string; width?: string } = $props();
</script>

<div class="o-skeleton" style:height style:width aria-hidden="true"></div>

<style>
	.o-skeleton { background: repeating-linear-gradient(-45deg, var(--o-surface-2) 0 10px, var(--o-surface-3) 10px 20px); border: 1px solid var(--o-border); }
</style>

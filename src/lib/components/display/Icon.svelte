<script lang="ts">
	import { iconPath, type IconName } from '../../utils/icons.js';
	let { name, size = 16, stroke = 1.8 }: { name: IconName; size?: number; stroke?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
	<path d={iconPath(name)} />
</svg>

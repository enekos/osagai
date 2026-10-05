<script lang="ts" generics="T">
	import { toOptions, type OptionInput } from '../../utils/options.js';

	let {
		value = $bindable(),
		options,
		label,
		name,
		inline = false
	}: { value: T; options: readonly OptionInput<T>[]; label?: string; name?: string; inline?: boolean } = $props();

	const auto = $props.id();
	const group = $derived(name ?? `o-radio-${auto}`);
	const items = $derived(toOptions(options));
</script>

<div class="o-radios" class:o-inline={inline} role="radiogroup" aria-label={label}>
	{#each items as o}
		<label class="o-radio">
			<input type="radio" name={group} checked={o.value === value} disabled={o.disabled} onchange={() => (value = o.value)} />
			<span>{o.label}</span>
		</label>
	{/each}
</div>

<style>
	.o-radios { display: flex; flex-direction: column; gap: 6px; }
	.o-inline { flex-direction: row; flex-wrap: wrap; gap: 14px; }
	.o-radio { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; cursor: pointer; margin: 0; }
	input { width: 16px; height: 16px; margin: 0; accent-color: var(--o-accent); flex-shrink: 0; }
	.o-radio:has(input:disabled) { opacity: 0.55; cursor: not-allowed; }
</style>

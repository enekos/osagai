<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { getField } from '../../context/field.js';
	import { toOptions, type OptionInput } from '../../utils/options.js';

	let {
		value = $bindable(),
		options = [],
		placeholder,
		size = 'md',
		id,
		children,
		class: className = '',
		...rest
	}: Omit<HTMLSelectAttributes, 'size' | 'value'> & {
		value?: T | null;
		options?: readonly OptionInput<T>[];
		placeholder?: string;
		size?: 'md' | 'sm';
		children?: Snippet;
	} = $props();

	const field = getField();
	const items = $derived(toOptions(options));
</script>

<select
	bind:value
	id={id ?? field?.id}
	aria-describedby={field?.describedBy}
	aria-invalid={field?.invalid || undefined}
	class="o-control o-{size} {className}"
	{...rest}>
	{#if placeholder !== undefined}<option value={null}>{placeholder}</option>{/if}
	{#each items as o}<option value={o.value} disabled={o.disabled}>{o.label}</option>{/each}
	{@render children?.()}
</select>

<style>
	.o-control {
		width: 100%; padding: 7px 34px 7px 10px; border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius);
		background-color: var(--o-surface); color: var(--o-text); outline: none; min-height: var(--o-control-h); font: inherit;
		appearance: none; -webkit-appearance: none;
		background-image: linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%);
		background-position: calc(100% - 14px) 50%, calc(100% - 9px) 50%; background-size: 5px 5px, 5px 5px; background-repeat: no-repeat;
	}
	.o-control:focus { border-color: var(--o-accent); box-shadow: inset 0 0 0 1px var(--o-accent); }
	.o-control:disabled { background-color: var(--o-surface-2); border-color: var(--o-border); }
	.o-control[aria-invalid="true"] { border-color: var(--o-danger); }
	.o-sm { min-height: var(--o-control-h-sm); padding-top: 3px; padding-bottom: 3px; padding-left: 8px; font-size: 13px; }
</style>

<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getField } from '../../context/field.js';

	let {
		value = $bindable(),
		size = 'md',
		mono = false,
		bare = false,
		id,
		element = $bindable(),
		class: className = '',
		...rest
	}: Omit<HTMLInputAttributes, 'size'> & { size?: 'md' | 'sm'; mono?: boolean; bare?: boolean; element?: HTMLInputElement } = $props();

	const field = getField();
</script>

<input
	bind:this={element}
	bind:value
	id={id ?? field?.id}
	aria-describedby={field?.describedBy}
	aria-invalid={field?.invalid || undefined}
	class="o-control o-{size} {className}"
	class:o-mono={mono}
	class:o-bare={bare}
	{...rest} />

<style>
	.o-control {
		width: 100%; padding: 7px 10px; border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius);
		background: var(--o-surface); color: var(--o-text); outline: none; min-height: var(--o-control-h); font: inherit;
	}
	.o-control::placeholder { color: var(--o-text-3); }
	.o-control:focus { border-color: var(--o-accent); box-shadow: inset 0 0 0 1px var(--o-accent); }
	.o-control:disabled, .o-control:read-only:not([type="date"], [type="datetime-local"]) { background: var(--o-surface-2); }
	.o-control:disabled { border-color: var(--o-border); }
	.o-control[aria-invalid="true"] { border-color: var(--o-danger); }
	.o-sm { min-height: var(--o-control-h-sm); padding: 4px 8px; font-size: 13px; }
	.o-mono { font-family: var(--o-mono); font-size: 12.5px; }
	.o-bare, .o-bare:disabled { border-color: transparent; background: transparent; border-radius: 0; padding-inline: 0; min-height: 0; box-shadow: none; }
	.o-bare:focus { border-color: transparent; border-bottom-color: var(--o-accent); box-shadow: none; }
</style>

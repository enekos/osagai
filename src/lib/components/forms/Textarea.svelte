<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { getField } from '../../context/field.js';

	let {
		value = $bindable(),
		mono = false,
		id,
		element = $bindable(),
		class: className = '',
		...rest
	}: HTMLTextareaAttributes & { mono?: boolean; element?: HTMLTextAreaElement } = $props();

	const field = getField();
</script>

<textarea
	bind:this={element}
	bind:value
	id={id ?? field?.id}
	aria-describedby={field?.describedBy}
	aria-invalid={field?.invalid || undefined}
	class="o-control {className}"
	class:o-mono={mono}
	{...rest}></textarea>

<style>
	.o-control {
		display: block; width: 100%; padding: 7px 10px; border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius);
		background: var(--o-surface); color: var(--o-text); outline: none; min-height: 80px; resize: vertical; font: inherit;
	}
	.o-control::placeholder { color: var(--o-text-3); }
	.o-control:focus { border-color: var(--o-accent); box-shadow: inset 0 0 0 1px var(--o-accent); }
	.o-control:disabled { background: var(--o-surface-2); border-color: var(--o-border); }
	.o-control[aria-invalid="true"] { border-color: var(--o-danger); }
	.o-mono { font-family: var(--o-mono); font-size: 12.5px; }
</style>

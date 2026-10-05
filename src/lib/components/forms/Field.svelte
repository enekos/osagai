<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setField } from '../../context/field.js';

	let {
		label,
		hint,
		error,
		optional = false,
		id,
		grow = false,
		aside,
		class: className = '',
		children
	}: {
		label?: string | Snippet;
		hint?: string | Snippet;
		error?: string | null;
		optional?: boolean;
		id?: string;
		grow?: boolean;
		aside?: Snippet;
		class?: string;
		children: Snippet;
	} = $props();

	const auto = $props.id();
	const controlId = $derived(id ?? `o-field-${auto}`);
	const hintId = $derived(`${controlId}-hint`);
	setField({
		get id() { return controlId; },
		get describedBy() { return hint || error ? hintId : undefined; },
		get invalid() { return !!error; }
	});
</script>

<div class="o-field {className}" class:o-grow={grow}>
	{#if label || aside}
		<div class="o-label-row">
			{#if label}
				<label for={controlId}>{#if typeof label === 'string'}{label}{:else}{@render label()}{/if}{#if optional} <span class="o-optional">(optional)</span>{/if}</label>
			{/if}
			{#if aside}<span class="o-aside">{@render aside()}</span>{/if}
		</div>
	{/if}
	{@render children()}
	{#if error}
		<div class="o-hint o-error" id={hintId}>{error}</div>
	{:else if hint}
		<div class="o-hint" id={hintId}>{#if typeof hint === 'string'}{hint}{:else}{@render hint()}{/if}</div>
	{/if}
</div>

<style>
	.o-field { margin-bottom: 14px; min-width: 0; }
	.o-grow { flex: 1; }
	.o-label-row { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 5px; }
	label { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; color: var(--o-text); }
	.o-optional { font-weight: 400; color: var(--o-text-3); }
	.o-aside { font-size: 12px; color: var(--o-text-3); }
	.o-hint { font-size: 12px; color: var(--o-text-3); margin-top: 5px; }
	.o-error { color: var(--o-danger); font-weight: 500; }
</style>

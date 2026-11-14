<script lang="ts" generics="T">
	import Icon from '../display/Icon.svelte';
	import { toOptions, type OptionInput } from '../../utils/options.js';

	let {
		value = $bindable(),
		options,
		size = 'md',
		label,
		block = false,
		disabled = false,
		onchange
	}: { value: T; options: readonly OptionInput<T>[]; size?: 'md' | 'sm'; label?: string; block?: boolean; disabled?: boolean; onchange?: (value: T) => void } = $props();

	const opts = $derived(toOptions(options));
	let root: HTMLDivElement | undefined = $state();

	function pick(v: T) {
		if (v === value) return;
		value = v;
		onchange?.(v);
	}

	function onkeydown(e: KeyboardEvent) {
		const back = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
		const fwd = e.key === 'ArrowRight' || e.key === 'ArrowDown';
		if (!back && !fwd && e.key !== 'Home' && e.key !== 'End') return;
		e.preventDefault();
		const radios = root ? [...root.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)')] : [];
		if (!radios.length) return;
		const at = radios.indexOf(document.activeElement as HTMLButtonElement);
		const next = e.key === 'Home' ? 0 : e.key === 'End' ? radios.length - 1 : fwd ? (at + 1) % radios.length : (at - 1 + radios.length) % radios.length;
		radios[next]?.focus();
		radios[next]?.click();
	}

	const checkedIndex = $derived(opts.findIndex((o) => o.value === value));
</script>

<div class="o-segmented o-{size}" class:o-block={block} role="radiogroup" aria-label={label} aria-disabled={disabled || undefined} tabindex="-1" bind:this={root} {onkeydown}>
	{#each opts as o, i (i)}
		<button
			type="button"
			role="radio"
			aria-checked={o.value === value}
			tabindex={i === (checkedIndex < 0 ? 0 : checkedIndex) ? 0 : -1}
			class:o-active={o.value === value}
			disabled={disabled || o.disabled}
			onclick={() => pick(o.value)}>{#if o.icon}<Icon name={o.icon} size={13} />{/if}{o.label}</button>
	{/each}
</div>

<style>
	.o-segmented { display: inline-flex; max-width: 100%; overflow-x: auto; border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius); background: var(--o-surface); flex-shrink: 0; }
	button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 7px 14px; border: none; border-right: 1px solid var(--o-border-strong); background: none; color: var(--o-text-2); font: inherit; font-weight: 600; font-size: 13px; white-space: nowrap; cursor: pointer; transition: background var(--o-duration-fast) var(--o-ease-out), color var(--o-duration-fast) var(--o-ease-out); }
	button:last-child { border-right: none; }
	button:hover { color: var(--o-text); background: var(--o-surface-2); }
	.o-active, .o-active:hover { color: var(--o-surface); background: var(--o-ink); }
	.o-sm button { padding: 4px 10px; font-size: 12px; }
	.o-block { display: flex; width: 100%; }
	.o-block button { flex: 1; }
</style>

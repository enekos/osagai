<script lang="ts" generics="T">
	import Icon from '../display/Icon.svelte';
	import { toOptions, type OptionInput } from '../../utils/options.js';

	let {
		value = $bindable(),
		options,
		label,
		columns,
		onchange
	}: { value?: T; options: readonly OptionInput<T>[]; label?: string; columns?: number; onchange?: (value: T) => void } = $props();

	const items = $derived(toOptions(options));
	const picked = $derived(items.findIndex((o) => o.value === value));
	const focusable = $derived(picked >= 0 ? picked : items.findIndex((o) => !o.disabled));
	let root = $state<HTMLElement>();

	function pick(i: number) {
		const o = items[i];
		if (!o || o.disabled) return;
		value = o.value;
		onchange?.(o.value);
	}
	function onkey(e: KeyboardEvent, i: number) {
		const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
		if (!step) return;
		e.preventDefault();
		let j = i;
		for (let n = 0; n < items.length; n++) {
			j = (j + step + items.length) % items.length;
			if (!items[j].disabled) break;
		}
		pick(j);
		root?.querySelectorAll<HTMLElement>('[role="radio"]')[j]?.focus();
	}
</script>

<div class="o-choice" role="radiogroup" aria-label={label} bind:this={root} style:grid-template-columns={columns ? `repeat(${columns}, minmax(0, 1fr))` : undefined}>
	{#each items as o, i}
		<button
			type="button"
			role="radio"
			aria-checked={i === picked}
			tabindex={i === focusable ? 0 : -1}
			disabled={o.disabled}
			class:o-on={i === picked}
			onclick={() => pick(i)}
			onkeydown={(e) => onkey(e, i)}>
			{#if o.icon}<span class="o-ico"><Icon name={o.icon} size={18} stroke={1.5} /></span>{/if}
			<span class="o-body">
				<strong>{o.label}</strong>
				{#if o.description}<span class="o-desc">{o.description}</span>{/if}
			</span>
		</button>
	{/each}
</div>

<style>
	.o-choice { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; }
	button {
		display: flex; gap: 10px; align-items: flex-start; min-width: 0; padding: 12px 14px; text-align: left; font: inherit; color: var(--o-text); cursor: pointer;
		background: var(--o-surface); border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius-lg);
		transition: transform 0.06s ease, box-shadow 0.06s ease, background 0.12s;
	}
	button:hover:not(:disabled) { background: var(--o-surface-2); }
	button:focus-visible { outline: 2px solid var(--o-accent); outline-offset: 2px; }
	button:disabled { opacity: 0.45; cursor: not-allowed; }
	.o-on, .o-on:hover:not(:disabled) { background: var(--o-mark); color: var(--o-mark-ink); box-shadow: var(--o-shadow); }
	.o-ico { flex-shrink: 0; display: inline-grid; place-items: center; margin-top: 1px; }
	.o-body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
	strong { font-weight: 700; letter-spacing: -0.01em; }
	.o-desc { font-size: 12.5px; color: var(--o-text-2); }
	.o-on .o-desc { color: var(--o-mark-ink); opacity: 0.8; }
	@media (max-width: 760px) {
		.o-choice { grid-template-columns: 1fr !important; }
	}
</style>

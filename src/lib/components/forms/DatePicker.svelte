<script lang="ts">
	import { flushSync } from 'svelte';
	import Button from '../actions/Button.svelte';
	import Icon from '../display/Icon.svelte';
	import { anchor } from '../../actions/anchor.js';
	import { getField } from '../../context/field.js';
	import { addDays, addMonths, clampDate, formatDate, isDate, monthGrid, today, weekday, weekdayNames } from '../../utils/dates.js';

	const uid = $props.id();

	let {
		value = $bindable(null),
		min,
		max,
		placeholder = 'Pick a date',
		size = 'md',
		label,
		locale,
		format = { dateStyle: 'medium' },
		weekStart = 1,
		clearable = false,
		disabled = false,
		name,
		id,
		onchange,
		class: className = ''
	}: {
		value?: string | null;
		min?: string;
		max?: string;
		placeholder?: string;
		size?: 'md' | 'sm';
		label?: string;
		locale?: string;
		format?: Intl.DateTimeFormatOptions;
		weekStart?: number;
		clearable?: boolean;
		disabled?: boolean;
		name?: string;
		id?: string;
		onchange?: (value: string | null) => void;
		class?: string;
	} = $props();

	const field = getField();
	const titleId = `o-dp-${uid}-title`;
	let trigger: HTMLButtonElement | undefined = $state();
	let panel: HTMLDivElement | undefined = $state();
	let open = $state(false);
	let view = $state(today());

	const chosen = $derived(isDate(value) ? value : null);
	const now = $derived(today());
	const days = $derived(monthGrid(view, weekStart));
	const month = $derived(view.slice(0, 7));
	const heads = $derived(weekdayNames(weekStart, locale, 'short'));
	const fullHeads = $derived(weekdayNames(weekStart, locale, 'long'));
	const todayAllowed = $derived(clampDate(now, min, max) === now);

	const outOfRange = (d: string) => (!!min && d < min) || (!!max && d > max);

	function focusView() {
		flushSync();
		panel?.querySelector<HTMLButtonElement>(`[data-date="${view}"]`)?.focus();
	}

	function show() {
		if (disabled || open) return;
		view = clampDate(chosen ?? now, min, max);
		open = true;
		focusView();
	}
	function close(refocus = false) {
		open = false;
		if (refocus) trigger?.focus();
	}
	function pick(d: string | null) {
		if (d && outOfRange(d)) return;
		value = d;
		close(true);
		onchange?.(d);
	}
	function go(next: string, focus = true) {
		view = clampDate(next, min, max);
		if (focus) focusView();
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			e.stopPropagation();
			close(true);
			return;
		}
		if (!(e.target as HTMLElement).dataset.date) return;
		const lead = (weekday(view) - weekStart + 7) % 7;
		const moves: Record<string, () => string> = {
			ArrowLeft: () => addDays(view, -1),
			ArrowRight: () => addDays(view, 1),
			ArrowUp: () => addDays(view, -7),
			ArrowDown: () => addDays(view, 7),
			Home: () => addDays(view, -lead),
			End: () => addDays(view, 6 - lead),
			PageUp: () => addMonths(view, e.shiftKey ? -12 : -1),
			PageDown: () => addMonths(view, e.shiftKey ? 12 : 1)
		};
		const move = moves[e.key];
		if (!move) return;
		e.preventDefault();
		go(move());
	}
	function onfocusout(e: FocusEvent) {
		const to = e.relatedTarget as Node | null;
		if (to && (panel?.contains(to) || trigger?.contains(to))) return;
		if (to) close();
	}
</script>

<span class="o-dp {className}">
	<button
		bind:this={trigger}
		type="button"
		id={id ?? field?.id}
		class="o-control o-dp-trigger o-{size}"
		class:o-dp-empty={!chosen}
		{disabled}
		aria-label={label}
		aria-describedby={field?.describedBy}
		data-invalid={field?.invalid || undefined}
		aria-haspopup="dialog"
		aria-expanded={open}
		onclick={() => (open ? close() : show())}
		onkeydown={(e) => {
			if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
				e.preventDefault();
				show();
			}
		}}>
		<span class="o-dp-text">{chosen ? formatDate(chosen, format, locale) : placeholder}</span>
		<span class="o-dp-icon" aria-hidden="true"><Icon name="calendar" size={14} /></span>
	</button>
	{#if name}<input type="hidden" {name} value={chosen ?? ''} />{/if}
	{#if open}
		<div
			bind:this={panel}
			class="o-dp-pop"
			role="dialog"
			aria-modal="false"
			aria-labelledby={titleId}
			tabindex="-1"
			{onkeydown}
			{onfocusout}
			use:anchor={{ to: trigger, align: 'start', onoutside: () => close() }}>
			<div class="o-dp-head">
				<Button variant="ghost" size="sm" icon="chevron-left" label="Previous month" disabled={!!min && addMonths(view, -1).slice(0, 7) < min.slice(0, 7)} onclick={() => go(addMonths(view, -1), false)} />
				<span class="o-dp-title" id={titleId} aria-live="polite">{formatDate(view, { month: 'long', year: 'numeric' }, locale)}</span>
				<Button variant="ghost" size="sm" icon="chevron" label="Next month" disabled={!!max && addMonths(view, 1).slice(0, 7) > max.slice(0, 7)} onclick={() => go(addMonths(view, 1), false)} />
			</div>
			<table class="o-dp-grid" role="grid" aria-labelledby={titleId}>
				<thead>
					<tr>
						{#each heads as h, i}<th scope="col" abbr={fullHeads[i]}>{h}</th>{/each}
					</tr>
				</thead>
				<tbody>
					{#each { length: 6 } as _, row}
						<tr>
							{#each days.slice(row * 7, row * 7 + 7) as d (d)}
								<td role="gridcell" aria-selected={d === chosen}>
									<button
										type="button"
										class="o-dp-day"
										class:o-dp-other={d.slice(0, 7) !== month}
										class:o-dp-today={d === now}
										class:o-dp-chosen={d === chosen}
										data-date={d}
										tabindex={d === view ? 0 : -1}
										disabled={outOfRange(d)}
										aria-label={formatDate(d, { dateStyle: 'full' }, locale)}
										aria-current={d === now ? 'date' : undefined}
										onclick={() => pick(d)}>{+d.slice(8)}</button>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
			{#if todayAllowed || (clearable && chosen)}
				<div class="o-dp-foot">
					{#if todayAllowed}<Button variant="ghost" size="sm" onclick={() => pick(now)}>Today</Button>{/if}
					{#if clearable && chosen}<Button variant="ghost" size="sm" onclick={() => pick(null)}>Clear</Button>{/if}
				</div>
			{/if}
		</div>
	{/if}
</span>

<style>
	.o-dp { position: relative; display: block; min-width: 0; }
	.o-control {
		display: flex; align-items: center; gap: 8px; width: 100%; padding: 7px 10px; text-align: left; cursor: pointer;
		border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius);
		background: var(--o-surface); color: var(--o-text); outline: none; min-height: var(--o-control-h); font: inherit;
	}
	.o-control:focus-visible, .o-control[aria-expanded="true"] { border-color: var(--o-accent); box-shadow: inset 0 0 0 1px var(--o-accent); }
	.o-control:disabled { background: var(--o-surface-2); border-color: var(--o-border); cursor: default; }
	.o-control[data-invalid="true"] { border-color: var(--o-danger); }
	.o-sm { min-height: var(--o-control-h-sm); padding: 4px 8px; font-size: 13px; }
	.o-dp-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.o-dp-empty .o-dp-text { color: var(--o-text-3); }
	.o-dp-icon { display: inline-flex; color: var(--o-text-3); }
	.o-dp-pop { z-index: 70; padding: 8px; background: var(--o-surface); color: var(--o-text); border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius); box-shadow: var(--o-shadow-lg); outline: none; }
	.o-dp-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
	.o-dp-title { font-size: 13px; font-weight: 600; }
	.o-dp-grid { border-collapse: collapse; }
	.o-dp-grid th { padding: 0 0 4px; font-size: 11px; font-weight: 600; color: var(--o-text-3); text-align: center; }
	.o-dp-grid td { padding: 1px; }
	.o-dp-day {
		width: 32px; height: 30px; padding: 0; border: 1px solid transparent; border-radius: calc(var(--o-radius) - 1px);
		background: transparent; color: var(--o-text); font: inherit; font-size: 13px; font-variant-numeric: tabular-nums; cursor: pointer; outline: none;
	}
	.o-dp-day:hover:not(:disabled) { background: var(--o-surface-2); }
	.o-dp-day:focus-visible { border-color: var(--o-border-strong); background: var(--o-surface-2); }
	.o-dp-other { color: var(--o-text-3); }
	.o-dp-today { font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
	.o-dp-chosen, .o-dp-chosen:hover:not(:disabled) { background: var(--o-accent); color: var(--o-accent-ink); border-color: var(--o-border-strong); }
	.o-dp-day:disabled { color: var(--o-text-3); opacity: 0.45; cursor: default; }
	.o-dp-foot { display: flex; justify-content: space-between; gap: 8px; margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--o-border); }
</style>

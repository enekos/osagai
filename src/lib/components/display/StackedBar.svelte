<script lang="ts" module>
	export interface BarSegment {
		label: string;
		value: number;
		color?: string;
	}
</script>

<script lang="ts">
	let {
		segments,
		total,
		label,
		legend = true,
		format = (v: number) => v.toLocaleString(),
		size = 'md'
	}: {
		segments: readonly BarSegment[];
		total?: number;
		label: string;
		legend?: boolean;
		format?: (value: number) => string;
		size?: 'sm' | 'md' | 'lg';
	} = $props();

	const sum = $derived(segments.reduce((n, s) => n + Math.max(0, s.value), 0));
	const whole = $derived(Math.max(total ?? sum, sum) || 1);
	const colour = (s: BarSegment, i: number) => s.color ?? `var(--o-c${(i % 10) + 1})`;
	const pct = (v: number) => (Math.max(0, v) / whole) * 100;
	const summary = $derived(`${label}: ${segments.map((s) => `${s.label} ${format(s.value)}`).join(', ')}`);
</script>

<div class="o-stacked o-{size}">
	<div class="o-track" role="img" aria-label={summary}>
		{#each segments as s, i (i)}
			{#if s.value > 0}<span class="o-seg" style:width="{pct(s.value)}%" style:background={colour(s, i)} title="{s.label}: {format(s.value)}"></span>{/if}
		{/each}
	</div>
	{#if legend}
		<ul class="o-legend" aria-hidden="true">
			{#each segments as s, i (i)}
				<li><span class="o-swatch" style:background={colour(s, i)}></span>{s.label}<span class="o-value">{format(s.value)}</span></li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.o-stacked { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
	.o-track { display: flex; height: 12px; overflow: hidden; background: var(--o-surface-2); border: 1px solid var(--o-border-strong); border-radius: var(--o-radius); }
	.o-sm .o-track { height: 6px; }
	.o-lg .o-track { height: 20px; }
	.o-seg { height: 100%; min-width: 2px; transition: width var(--o-duration-slow) var(--o-ease-out); }
	.o-seg + .o-seg { border-left: 1px solid var(--o-surface); }
	.o-legend { display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 0; padding: 0; list-style: none; font-size: 12px; color: var(--o-text-2); }
	.o-legend li { display: inline-flex; align-items: center; gap: 6px; }
	.o-swatch { width: 10px; height: 10px; border: 1px solid var(--o-border-strong); }
	.o-value { font-family: var(--o-mono); font-variant-numeric: tabular-nums; color: var(--o-text); }
</style>

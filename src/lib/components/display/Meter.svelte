<script lang="ts">
	let {
		value,
		min = 0,
		max = 100,
		low,
		high,
		optimum,
		target,
		tone,
		label,
		valueText,
		shape = 'bar',
		size = 'md',
		showValue = false
	}: {
		value: number;
		min?: number;
		max?: number;
		low?: number;
		high?: number;
		optimum?: number;
		target?: number;
		tone?: 'accent' | 'ok' | 'warn' | 'danger' | 'ink';
		label: string;
		valueText?: string;
		shape?: 'bar' | 'ring';
		size?: 'sm' | 'md' | 'lg';
		showValue?: boolean;
	} = $props();

	const span = $derived(max - min || 1);
	const at = (v: number) => Math.max(0, Math.min(100, ((v - min) / span) * 100));
	const pct = $derived(at(value));

	/** The tone `<meter>` would pick: the region holding `value` against the one holding `optimum`. */
	function zone(v: number): 0 | 1 | 2 {
		if (low !== undefined && v < low) return 0;
		if (high !== undefined && v > high) return 2;
		return 1;
	}
	const auto = $derived.by(() => {
		if (low === undefined && high === undefined) return 'accent';
		const want = zone(optimum ?? (min + max) / 2);
		const got = zone(value);
		if (got === want) return 'ok';
		return Math.abs(got - want) === 1 ? 'warn' : 'danger';
	});
	// The zone is otherwise conveyed by fill color alone (WCAG 1.4.1) — include it in the value text.
	const text = $derived(
		valueText ??
			(tone === undefined && auto !== 'accent'
				? `${Math.round(pct)}%, ${auto === 'ok' ? 'within range' : `${auto} range`}`
				: `${Math.round(pct)}%`)
	);
	const clamped = $derived(Math.min(max, Math.max(min, value)));
</script>

<div class="o-meter o-{shape} o-{size} o-{tone ?? auto}" role="meter" aria-label={label} aria-valuemin={min} aria-valuemax={max} aria-valuenow={clamped} aria-valuetext={text} style:--o-pct={pct}>
	{#if shape === 'ring'}
		<svg viewBox="0 0 36 36" aria-hidden="true">
			<circle class="o-track" cx="18" cy="18" r="15" pathLength="100" />
			<circle class="o-fill" cx="18" cy="18" r="15" pathLength="100" />
		</svg>
		{#if showValue}<span class="o-ring-value">{text}</span>{/if}
	{:else}
		<span class="o-bar-track">
			<span class="o-bar-fill"></span>
			{#if target !== undefined}<span class="o-target" style:left="{at(target)}%"></span>{/if}
		</span>
		{#if showValue}<span class="o-bar-value">{text}</span>{/if}
	{/if}
</div>

<style>
	.o-meter { --o-tone: var(--o-accent); display: flex; align-items: center; gap: 8px; min-width: 0; }
	.o-ok { --o-tone: var(--o-ok); }
	.o-warn { --o-tone: var(--o-warn); }
	.o-danger { --o-tone: var(--o-danger); }
	.o-ink { --o-tone: var(--o-ink); }

	.o-bar { width: 100%; }
	.o-bar-track { position: relative; flex: 1; min-width: 40px; height: 8px; background: var(--o-surface-2); border: 1px solid var(--o-border-strong); border-radius: var(--o-radius); }
	.o-bar.o-sm .o-bar-track { height: 4px; border-width: 0; }
	.o-bar.o-lg .o-bar-track { height: 14px; }
	.o-bar-fill { position: absolute; inset: 0 auto 0 0; width: calc(var(--o-pct) * 1%); background: var(--o-tone); transition: width var(--o-duration-slow) var(--o-ease-out); }
	.o-target { position: absolute; top: -4px; bottom: -4px; width: 2px; margin-left: -1px; background: var(--o-ink); }
	.o-bar-value { flex: none; min-width: 4ch; text-align: right; font-family: var(--o-mono); font-size: 11.5px; font-variant-numeric: tabular-nums; color: var(--o-text-2); }

	.o-ring { position: relative; display: inline-grid; place-items: center; flex: none; }
	.o-ring.o-sm { width: 18px; height: 18px; }
	.o-ring.o-md { width: 40px; height: 40px; }
	.o-ring.o-lg { width: 64px; height: 64px; }
	svg { width: 100%; height: 100%; transform: rotate(-90deg); }
	circle { fill: none; stroke-width: 4; }
	.o-sm circle { stroke-width: 5; }
	.o-track { stroke: var(--o-surface-3); }
	.o-fill { stroke: var(--o-tone); stroke-dasharray: var(--o-pct) 100; transition: stroke-dasharray var(--o-duration-slow) var(--o-ease-out); }
	.o-ring-value { position: absolute; font-family: var(--o-mono); font-size: 9.5px; letter-spacing: -0.04em; font-weight: 700; font-variant-numeric: tabular-nums; }
	.o-ring.o-lg .o-ring-value { font-size: 14px; }
	.o-ring.o-sm .o-ring-value { display: none; }
</style>

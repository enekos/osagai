<script lang="ts">
	let {
		value = null,
		max = 100,
		label,
		shape = 'bar',
		size = 'md',
		tone = 'accent',
		showValue = false
	}: {
		value?: number | null;
		max?: number;
		label: string;
		shape?: 'bar' | 'ring';
		size?: 'sm' | 'md' | 'lg';
		tone?: 'accent' | 'ok' | 'warn' | 'danger' | 'ink';
		showValue?: boolean;
	} = $props();

	const pct = $derived(value === null || max <= 0 ? null : Math.max(0, Math.min(100, (value / max) * 100)));
	const text = $derived(pct === null ? undefined : `${Math.round(pct)}%`);
</script>

<div
	class="o-progress o-{shape} o-{size} o-{tone}"
	class:o-indeterminate={pct === null}
	role="progressbar"
	aria-label={label}
	aria-valuemin={0}
	aria-valuemax={pct === null ? undefined : max}
	aria-valuenow={pct === null ? undefined : value}
	aria-valuetext={text}
	style:--o-pct={pct ?? 30}>
	{#if shape === 'ring'}
		<svg viewBox="0 0 36 36" aria-hidden="true">
			<circle class="o-track" cx="18" cy="18" r="15" pathLength="100" />
			<circle class="o-fill" cx="18" cy="18" r="15" pathLength="100" />
		</svg>
		{#if showValue && text}<span class="o-ring-value">{text}</span>{/if}
	{:else}
		<span class="o-bar-track"><span class="o-bar-fill"></span></span>
		{#if showValue && text}<span class="o-bar-value">{text}</span>{/if}
	{/if}
</div>

<style>
	.o-progress { --o-tone: var(--o-accent); display: flex; align-items: center; gap: 8px; min-width: 0; }
	.o-ok { --o-tone: var(--o-ok); }
	.o-warn { --o-tone: var(--o-warn); }
	.o-danger { --o-tone: var(--o-danger); }
	.o-ink { --o-tone: var(--o-ink); }

	.o-bar { width: 100%; }
	.o-bar-track { position: relative; flex: 1; min-width: 40px; height: 8px; overflow: hidden; background: var(--o-surface-2); border: 1px solid var(--o-border-strong); border-radius: var(--o-radius); }
	.o-bar.o-sm .o-bar-track { height: 4px; border-width: 0; }
	.o-bar.o-lg .o-bar-track { height: 14px; }
	.o-bar-fill { position: absolute; inset: 0 auto 0 0; width: calc(var(--o-pct) * 1%); background: var(--o-tone); transition: width var(--o-duration-slow) var(--o-ease-out); }
	.o-indeterminate .o-bar-fill { animation: o-progress-slide 1.2s var(--o-ease-out) infinite; }
	@keyframes o-progress-slide { from { transform: translateX(-100%); } to { transform: translateX(340%); } }
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
	.o-indeterminate svg { animation: o-progress-spin 0.9s linear infinite; }
	@keyframes o-progress-spin { from { transform: rotate(-90deg); } to { transform: rotate(270deg); } }
	.o-ring-value { position: absolute; font-family: var(--o-mono); font-size: 9.5px; letter-spacing: -0.04em; font-weight: 700; font-variant-numeric: tabular-nums; }
	.o-ring.o-lg .o-ring-value { font-size: 14px; }
	.o-ring.o-sm .o-ring-value { display: none; }
</style>

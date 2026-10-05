<script module lang="ts">
	const stack: symbol[] = [];
	const SIZES = { sm: '440px', md: '560px', lg: '720px', xl: '960px' } as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../display/Icon.svelte';
	import { trapTab } from '../../utils/focus.js';

	let {
		open = $bindable(false),
		title = '',
		size = 'md',
		width,
		dismissible = true,
		onclose,
		children,
		footer,
		headerActions
	}: {
		open?: boolean;
		title?: string;
		size?: keyof typeof SIZES;
		width?: string;
		dismissible?: boolean;
		onclose?: () => void;
		children: Snippet;
		footer?: Snippet;
		headerActions?: Snippet;
	} = $props();

	const me = Symbol('modal');
	let panel: HTMLDivElement | undefined = $state();

	function close() {
		if (!dismissible) return;
		open = false;
		onclose?.();
	}

	function onkeydown(e: KeyboardEvent) {
		if (stack.at(-1) !== me) return;
		if (e.key === 'Escape') {
			e.stopPropagation();
			close();
			return;
		}
		if (e.key === 'Tab' && panel) trapTab(e, panel);
	}

	$effect(() => {
		if (!open) return;
		const before = document.activeElement as HTMLElement | null;
		stack.push(me);
		const overflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		requestAnimationFrame(() => {
			if (!panel || panel.contains(document.activeElement)) return;
			const target = panel.querySelector<HTMLElement>('[autofocus], .o-modal-body :is(input, select, textarea):not([disabled])') ?? panel;
			target.focus();
		});
		return () => {
			stack.splice(stack.indexOf(me), 1);
			if (stack.length === 0) document.body.style.overflow = overflow;
			before?.focus?.();
		};
	});
</script>

<svelte:window onkeydown={open ? onkeydown : undefined} />

{#if open}
	<div class="o-backdrop" role="presentation" onmousedown={(e) => { if (e.target === e.currentTarget) close(); }}>
		<div class="o-modal" role="dialog" aria-modal="true" aria-label={title} tabindex="-1" bind:this={panel} style:max-width={width ?? SIZES[size]}>
			<header>
				<h2>{title}</h2>
				<div class="o-head-actions">
					{@render headerActions?.()}
					{#if dismissible}<button type="button" class="o-close" onclick={close} aria-label="Close"><Icon name="x" size={14} /></button>{/if}
				</div>
			</header>
			<div class="o-modal-body">{@render children()}</div>
			{#if footer}<footer>{@render footer()}</footer>{/if}
		</div>
	</div>
{/if}

<style>
	.o-backdrop { position: fixed; inset: 0; background: var(--o-scrim); display: flex; align-items: flex-start; justify-content: center; padding: 7vh 16px; z-index: 50; overflow: auto; }
	.o-modal { width: 100%; background: var(--o-surface); border-radius: var(--o-radius-lg); border: var(--o-line) solid var(--o-border-strong); box-shadow: var(--o-shadow-lg); display: flex; flex-direction: column; max-height: 86vh; outline: none; }
	header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 12px 12px 18px; border-bottom: var(--o-line) solid var(--o-border-strong); background: var(--o-ink); color: var(--o-surface); }
	h2 { color: var(--o-surface); font-size: 18px; min-width: 0; }
	.o-head-actions { display: flex; gap: 6px; align-items: center; }
	.o-close { width: 30px; height: 30px; display: inline-grid; place-items: center; border: none; background: transparent; color: var(--o-surface); border-radius: var(--o-radius); cursor: pointer; }
	.o-close:hover { background: var(--o-accent); color: var(--o-accent-ink); }
	.o-modal-body { padding: 20px 18px; overflow: auto; }
	footer { padding: 12px 18px; border-top: var(--o-line) solid var(--o-border-strong); display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 10px; background: var(--o-surface-2); }
	@media (max-width: 760px) {
		.o-backdrop { padding: 12px 8px; }
		.o-modal { max-height: calc(100dvh - 24px); }
	}
</style>

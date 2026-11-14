<script lang="ts">
	import Button from '../actions/Button.svelte';
	import Icon from '../display/Icon.svelte';
	import { errorMessage } from '../../utils/errors.js';
	import type { Query } from '../../state/query.svelte.js';

	let {
		error,
		query,
		title = 'Could not load this',
		onretry,
		compact = false
	}: {
		error?: unknown;
		query?: Query<unknown>;
		title?: string;
		onretry?: () => unknown;
		compact?: boolean;
	} = $props();

	const err = $derived(error ?? query?.error ?? null);
	const message = $derived(err === null ? '' : errorMessage(err));
	const retry = $derived(onretry ?? (query ? () => query.reload() : undefined));
	let busy = $state(false);

	async function run() {
		if (!retry) return;
		busy = true;
		try {
			await retry();
		} finally {
			busy = false;
		}
	}
</script>

{#if err !== null}
	<div class="o-query-error" class:o-compact={compact} role="alert">
		<span class="o-mark" aria-hidden="true"><Icon name="alert" size={14} /></span>
		<div class="o-text">
			<strong>{title}</strong>
			{#if message}<span class="o-message">{message}</span>{/if}
		</div>
		{#if retry}<Button size="sm" icon="refresh" loading={busy || query?.pending} onclick={run}>Retry</Button>{/if}
	</div>
{/if}

<style>
	.o-query-error { display: flex; align-items: center; gap: 12px; padding: 10px 12px; font-size: 13px; background: var(--o-danger-soft); color: var(--o-text); border: var(--o-line) solid var(--o-danger); border-radius: var(--o-radius); min-width: 0; }
	.o-compact { padding: 6px 8px; gap: 8px; }
	.o-mark { flex: none; display: inline-grid; place-items: center; width: 24px; height: 24px; background: var(--o-danger); color: var(--o-surface); border-radius: var(--o-radius); }
	.o-text { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow-wrap: anywhere; }
	.o-message { color: var(--o-text-2); font-size: 12.5px; }
</style>

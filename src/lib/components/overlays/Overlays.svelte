<script lang="ts">
	import Button from '../actions/Button.svelte';
	import Field from '../forms/Field.svelte';
	import Icon from '../display/Icon.svelte';
	import Input from '../forms/Input.svelte';
	import Modal from './Modal.svelte';
	import Notice from '../feedback/Notice.svelte';
	import { dialogs } from '../../state/dialog.svelte.js';
	import { toast } from '../../state/toast.svelte.js';
	import { tooltipId, tooltips } from '../../state/tooltip.svelte.js';
	import { anchor } from '../../actions/anchor.js';

	let typed = $state('');
	let answer = $state('');
	const req = $derived(dialogs.current);
	let open = $state(false);

	$effect.pre(() => {
		const r = dialogs.current;
		open = !!r;
		typed = '';
		answer = r?.kind === 'prompt' ? (r.options.value ?? '') : '';
	});

	const blocked = $derived.by(() => {
		if (!req) return true;
		if (req.kind === 'confirm') return !!req.options.typeToConfirm && typed !== req.options.typeToConfirm;
		return !!req.options.required && answer.trim() === '';
	});

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (blocked) return;
		dialogs.accept(req?.kind === 'prompt' ? answer : undefined);
	}
</script>

{#if req}
	<Modal bind:open title={req.options.title ?? 'Are you sure?'} size="sm" dismissible={!dialogs.busy} onclose={() => dialogs.dismiss()}>
		<form id="o-dialog-form" onsubmit={submit}>
			{#if req.kind === 'confirm'}
				{#if req.options.message}<p class="o-msg">{req.options.message}</p>{/if}
				{#if req.options.typeToConfirm}
					<Field>
						{#snippet label()}Type <strong>{req.options.typeToConfirm}</strong> to confirm{/snippet}
						<Input bind:value={typed} autocomplete="off" autofocus />
					</Field>
				{/if}
			{:else}
				<Field label={req.options.label} hint={req.options.hint}>
					<Input bind:value={answer} placeholder={req.options.placeholder} autocomplete="off" autofocus />
				</Field>
			{/if}
			{#if dialogs.error}<Notice tone="error" class="o-err">{dialogs.error}</Notice>{/if}
		</form>
		{#snippet footer()}
			<Button onclick={() => dialogs.dismiss()} disabled={dialogs.busy}>{(req.kind === 'confirm' && req.options.cancelLabel) || 'Cancel'}</Button>
			<Button
				type="submit"
				form="o-dialog-form"
				variant="primary"
				danger={req.kind === 'confirm' && req.options.danger !== false}
				loading={dialogs.busy}
				disabled={blocked}>{req.options.confirmLabel ?? (req.kind === 'confirm' ? 'Delete' : 'Save')}</Button>
		{/snippet}
	</Modal>
{/if}

{#if tooltips.current}
	<div class="o-tooltip" id={tooltipId(tooltips.current.id)} role="tooltip" use:anchor={{ to: tooltips.current.to, side: tooltips.current.side, gap: 6 }}>{tooltips.current.text}</div>
{/if}

<div class="o-toasts" aria-live="polite">
	{#each toast.items as t (t.id)}
		<div class="o-toast o-{t.kind}" role={t.kind === 'error' ? 'alert' : 'status'}>
			<Icon name={t.kind === 'ok' ? 'check' : t.kind === 'error' ? 'alert' : 'info'} />
			<span>{t.text}</span>
			<button type="button" onclick={() => toast.dismiss(t.id)} aria-label="Dismiss"><Icon name="x" size={14} /></button>
		</div>
	{/each}
</div>

<style>
	.o-msg { color: var(--o-text-2); margin: 0 0 14px; }
	form :global(.o-err) { margin-top: 12px; }
	.o-tooltip { z-index: 110; pointer-events: none; max-width: 280px; padding: 5px 8px; font-size: 12px; font-weight: 500; line-height: 1.35; background: var(--o-ink); color: var(--o-surface); border: var(--o-line) solid var(--o-border-strong); border-radius: var(--o-radius); box-shadow: var(--o-shadow-sm); overflow-wrap: anywhere; }
	.o-toasts { position: fixed; right: 16px; bottom: 16px; display: flex; flex-direction: column; gap: 8px; z-index: 100; max-width: min(420px, calc(100vw - 32px)); }
	.o-toast { display: flex; align-items: center; gap: 10px; padding: 10px 10px 10px 14px; border-radius: var(--o-radius); background: var(--o-ink); color: var(--o-surface); border: var(--o-line) solid var(--o-border-strong); box-shadow: 4px 4px 0 var(--o-accent); font-size: 13px; font-weight: 500; }
	.o-ok { box-shadow: 4px 4px 0 var(--o-ok); }
	.o-error { box-shadow: 4px 4px 0 var(--o-danger); }
	.o-toast span { flex: 1; overflow-wrap: anywhere; }
	.o-toast button { width: 26px; height: 26px; display: inline-grid; place-items: center; border: none; background: transparent; color: var(--o-surface); border-radius: var(--o-radius); cursor: pointer; flex-shrink: 0; }
	.o-toast button:hover { background: var(--o-accent); }
</style>

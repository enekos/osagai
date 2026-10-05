<script lang="ts">
	import Icon from '../display/Icon.svelte';
	import Spinner from '../feedback/Spinner.svelte';

	let {
		title = 'Drop files here or click to choose',
		hint,
		accept,
		multiple = false,
		busy = false,
		onfiles
	}: { title?: string; hint?: string; accept?: string; multiple?: boolean; busy?: boolean; onfiles: (files: File[]) => void } = $props();

	let input: HTMLInputElement | undefined = $state();
	let dragging = $state(false);

	function take(list: FileList | null | undefined) {
		const files = [...(list ?? [])];
		if (files.length) onfiles(multiple ? files : files.slice(0, 1));
	}
</script>

<button
	type="button"
	class="o-drop"
	class:o-dragging={dragging}
	disabled={busy}
	ondragover={(e) => { e.preventDefault(); dragging = true; }}
	ondragleave={() => (dragging = false)}
	ondrop={(e) => { e.preventDefault(); dragging = false; take(e.dataTransfer?.files); }}
	onclick={() => input?.click()}>
	{#if busy}<Spinner size={22} />{:else}<Icon name="upload" size={24} stroke={1.5} />{/if}
	<strong>{title}</strong>
	{#if hint}<span class="o-hint">{hint}</span>{/if}
</button>
<input bind:this={input} type="file" {accept} {multiple} hidden onchange={(e) => { take(e.currentTarget.files); e.currentTarget.value = ''; }} />

<style>
	.o-drop { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 34px 20px; border: var(--o-line) dashed var(--o-border-strong); border-radius: var(--o-radius-lg); color: var(--o-text-2); cursor: pointer; text-align: center; background: var(--o-surface); font: inherit; }
	.o-drop strong { color: var(--o-text); }
	.o-dragging, .o-drop:hover:not(:disabled) { background: var(--o-mark-soft); border-style: solid; }
	.o-drop:disabled { cursor: progress; }
	.o-hint { font-size: 12.5px; color: var(--o-text-2); }
</style>

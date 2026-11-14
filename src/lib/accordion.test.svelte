<script lang="ts">
	import Accordion from './components/layout/Accordion.svelte';
	import Collapsible from './components/layout/Collapsible.svelte';
	let { multiple = false }: { multiple?: boolean } = $props();
</script>

<Accordion {multiple}>
	<Collapsible title="One" open>First</Collapsible>
	<Collapsible title="Two">Second</Collapsible>
	<Collapsible title="Three">Third</Collapsible>
</Accordion>

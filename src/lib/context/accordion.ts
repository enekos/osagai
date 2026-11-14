import { getContext, setContext } from 'svelte';

const KEY = Symbol('osagai.accordion');

export interface AccordionContext {
	isOpen: (id: string) => boolean;
	toggle: (id: string, open: boolean) => void;
	register: (id: string, open: boolean) => void;
}

export function setAccordion(ctx: AccordionContext): void {
	setContext(KEY, ctx);
}

export function getAccordion(): AccordionContext | undefined {
	return getContext<AccordionContext | undefined>(KEY);
}

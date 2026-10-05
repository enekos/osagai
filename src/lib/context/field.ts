import { getContext, setContext } from 'svelte';

export interface FieldContext {
	readonly id: string;
	readonly describedBy: string | undefined;
	readonly invalid: boolean;
}

const KEY = Symbol('osagai.field');

export function setField(ctx: FieldContext): void {
	setContext(KEY, ctx);
}

export function getField(): FieldContext | undefined {
	return getContext<FieldContext | undefined>(KEY);
}

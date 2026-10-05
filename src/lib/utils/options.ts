export interface Option<T = unknown> {
	value: T;
	label: string;
	disabled?: boolean;
	badge?: string | number;
}

export type OptionInput<T = unknown> = T | readonly [T, string] | Option<T>;

function isOption<T>(o: unknown): o is Option<T> {
	return typeof o === 'object' && o !== null && !Array.isArray(o) && 'value' in o && 'label' in o;
}

export function toOptions<T>(items: readonly OptionInput<T>[]): Option<T>[] {
	return items.map((o) => {
		if (isOption<T>(o)) return o;
		if (Array.isArray(o) && o.length === 2) return { value: o[0] as T, label: String(o[1]) };
		return { value: o as T, label: String(o) };
	});
}

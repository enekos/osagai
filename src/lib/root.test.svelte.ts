export function withRoot<T>(fn: () => T): { value: T; destroy: () => void } {
	let value!: T;
	const destroy = $effect.root(() => {
		value = fn();
	});
	return { value, destroy };
}

export function reactive<T extends object>(initial: T): T {
	const value = $state(initial);
	return value;
}

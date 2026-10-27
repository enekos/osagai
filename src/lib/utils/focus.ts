const SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function focusables(container: HTMLElement): HTMLElement[] {
	return [...container.querySelectorAll<HTMLElement>(SELECTOR)].filter((el) => el.offsetParent !== null);
}

export function trapTab(e: KeyboardEvent, container: HTMLElement): void {
	if (e.key !== 'Tab') return;
	const list = focusables(container);
	const first = list.at(0);
	const last = list.at(-1);
	if (!first || !last) return;
	const active = document.activeElement as HTMLElement | null;
	const atEdge = e.shiftKey ? active === first : active === last;
	if (atEdge || !active || !container.contains(active)) {
		e.preventDefault();
		(e.shiftKey ? last : first).focus();
	}
}

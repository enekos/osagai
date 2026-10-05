export type Side = 'bottom' | 'top';
export type Align = 'start' | 'end';

export interface Box {
	left: number;
	top: number;
	width: number;
	height: number;
}

export interface Size {
	width: number;
	height: number;
}

export interface PlaceOptions {
	side?: Side;
	align?: Align;
	gap?: number;
	margin?: number;
	cover?: boolean;
}

export interface Placement {
	left: number;
	top: number;
	side: Side;
	room: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, hi));

export function placeBox(anchor: Box, panel: Size, view: Size, { side = 'bottom', align = 'start', gap: spacing = 4, margin = 8, cover = false }: PlaceOptions = {}): Placement {
	const gap = cover ? -anchor.height : spacing;
	const roomOn = (s: Side) => Math.max(0, s === 'bottom' ? view.height - anchor.top - anchor.height - gap - margin : anchor.top - gap - margin);
	const other: Side = side === 'bottom' ? 'top' : 'bottom';
	const chosen = roomOn(side) >= panel.height || (roomOn(other) < panel.height && roomOn(side) >= roomOn(other)) ? side : other;
	const room = roomOn(chosen);
	const height = Math.min(panel.height, room);
	const top = chosen === 'bottom' ? anchor.top + anchor.height + gap : anchor.top - gap - height;
	const preferred = align === 'start' ? anchor.left : anchor.left + anchor.width - panel.width;
	const left = clamp(preferred, margin, Math.max(margin, view.width - panel.width - margin));
	return { left, top: Math.max(margin, top), side: chosen, room };
}

export function errorMessage(e: unknown): string {
	if (typeof e === 'string') return e;
	if (e && typeof e === 'object' && 'message' in e) return String(e.message);
	return String(e);
}

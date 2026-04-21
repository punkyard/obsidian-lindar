export function getContrastTextColor(color: string): string {
	const hex = parseHexColor(color.trim());
	if (!hex) return "#fff";

	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.65 ? "#111" : "#fff";
}

export function parseHexColor(value: string): string | null {
	if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
		if (value.length === 4) {
			return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
		}
		return value.toLowerCase();
	}
	return null;
}
export function getContrastTextColor(color: string): string {
	const hex = parseHexColor(color.trim());
	if (!hex) return "#fff";

	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.65 ? "#111" : "#fff";
}

export function getRelatedEventLabelColor(color: string): string {
	const hex = parseHexColor(color.trim());
	if (!hex) return "#fff";

	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

	const { h, s, l } = rgbToHsl(r, g, b);
	const targetLightness = luminance > 0.56
		? Math.max(10, l - 52)
		: Math.min(92, l + 52);

	const adjusted = hslToRgb(h, s, targetLightness);
	return rgbToHex(adjusted.r, adjusted.g, adjusted.b);
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

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
	const rn = r / 255;
	const gn = g / 255;
	const bn = b / 255;

	const max = Math.max(rn, gn, bn);
	const min = Math.min(rn, gn, bn);
	const delta = max - min;

	let h = 0;
	if (delta !== 0) {
		switch (max) {
			case rn:
				h = ((gn - bn) / delta) % 6;
				break;
			case gn:
				h = (bn - rn) / delta + 2;
				break;
			default:
				h = (rn - gn) / delta + 4;
		}
		h *= 60;
		if (h < 0) h += 360;
	}

	const l = (max + min) / 2;
	const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

	return {
		h,
		s: s * 100,
		l: l * 100,
	};
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
	const sn = Math.max(0, Math.min(100, s)) / 100;
	const ln = Math.max(0, Math.min(100, l)) / 100;
	const c = (1 - Math.abs(2 * ln - 1)) * sn;
	const hPrime = (h % 360) / 60;
	const x = c * (1 - Math.abs((hPrime % 2) - 1));

	let rn = 0;
	let gn = 0;
	let bn = 0;

	if (hPrime >= 0 && hPrime < 1) {
		rn = c;
		gn = x;
	} else if (hPrime < 2) {
		rn = x;
		gn = c;
	} else if (hPrime < 3) {
		gn = c;
		bn = x;
	} else if (hPrime < 4) {
		gn = x;
		bn = c;
	} else if (hPrime < 5) {
		rn = x;
		bn = c;
	} else {
		rn = c;
		bn = x;
	}

	const m = ln - c / 2;
	return {
		r: Math.round((rn + m) * 255),
		g: Math.round((gn + m) * 255),
		b: Math.round((bn + m) * 255),
	};
}

function rgbToHex(r: number, g: number, b: number): string {
	const toHex = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
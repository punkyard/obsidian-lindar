export function getContrastTextColor(color: string): string {
	const parsed = parseColorToRgb(color.trim());
	if (!parsed) return "#fff";

	const { r, g, b } = parsed;
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.65 ? "#111" : "#fff";
}

export function getRelatedEventLabelColor(color: string): string {
	const parsed = parseColorToRgb(color.trim());
	if (!parsed) return "#111";

	const base = parsed;
	const baseHsl = rgbToHsl(base.r, base.g, base.b);
	const isNearNeutral = isNearNeutralColor(base, baseHsl);

	if (isNearNeutral) {
		return baseHsl.l >= 58 ? "#4f4f4f" : "#d6d6d6";
	}

	const shouldDarken = baseHsl.l >= 52;
	const relatedSaturation = Math.min(100, Math.max(baseHsl.s, 24) + 6);
	const lightnessCandidates = shouldDarken
		? [
			Math.max(18, baseHsl.l - 28),
			Math.max(14, baseHsl.l - 38),
			12,
		]
		: [
			Math.min(76, baseHsl.l + 28),
			Math.min(84, baseHsl.l + 38),
			90,
		];

	const fallbackLightness = lightnessCandidates[lightnessCandidates.length - 1] ?? (shouldDarken ? 12 : 90);
	let chosen = hslToRgb(baseHsl.h, relatedSaturation, fallbackLightness);
	let chosenContrast = contrastRatio(base, chosen);

	for (const candidateLightness of lightnessCandidates) {
		const candidate = hslToRgb(baseHsl.h, relatedSaturation, candidateLightness);
		const candidateContrast = contrastRatio(base, candidate);

		if (candidateContrast > chosenContrast) {
			chosen = candidate;
			chosenContrast = candidateContrast;
		}

		if (candidateContrast >= 4.5) {
			chosen = candidate;
			break;
		}
	}

	return rgbToHex(chosen.r, chosen.g, chosen.b);
}

export function getEventColorTone(color: string): "dark" | "light" {
	const parsed = parseColorToRgb(color.trim());
	if (!parsed) return "light";
	return relativeLuminance(parsed) < 0.24 ? "dark" : "light";
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

let colorProbeEl: HTMLElement | null = null;

function parseColorToRgb(value: string): { r: number; g: number; b: number } | null {
	const hex = parseHexColor(value);
	if (hex) {
		return {
			r: parseInt(hex.slice(1, 3), 16),
			g: parseInt(hex.slice(3, 5), 16),
			b: parseInt(hex.slice(5, 7), 16),
		};
	}

	const directRgb = value.match(/^rgba?\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*[\d.]+)?\)$/i);
	if (directRgb) {
		return {
			r: clampRgb(Number(directRgb[1])),
			g: clampRgb(Number(directRgb[2])),
			b: clampRgb(Number(directRgb[3])),
		};
	}

	if (typeof document === "undefined") return null;
	const probe = getColorProbeElement();
	if (!probe) return null;

	probe.style.color = "";
	probe.style.color = value;
	if (!probe.style.color) return null;

	const computed = getComputedStyle(probe).color;
	const computedRgb = computed.match(/^rgba?\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*[\d.]+)?\)$/i);
	if (!computedRgb) return null;

	return {
		r: clampRgb(Number(computedRgb[1])),
		g: clampRgb(Number(computedRgb[2])),
		b: clampRgb(Number(computedRgb[3])),
	};
}

function getColorProbeElement(): HTMLElement | null {
	if (colorProbeEl?.isConnected) return colorProbeEl;
	if (typeof document === "undefined") return null;

	const probe = document.createElement("span");
	probe.style.position = "fixed";
	probe.style.left = "-9999px";
	probe.style.top = "-9999px";
	probe.style.pointerEvents = "none";
	probe.style.opacity = "0";
	probe.style.width = "0";
	probe.style.height = "0";
	probe.style.overflow = "hidden";

	(document.body ?? document.documentElement).appendChild(probe);
	colorProbeEl = probe;
	return probe;
}

function clampRgb(value: number): number {
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.min(255, Math.round(value)));
}

function isNearNeutralColor(
	rgb: { r: number; g: number; b: number },
	hsl: { h: number; s: number; l: number }
): boolean {
	const channelSpread = Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b);
	return hsl.s <= 10 || channelSpread <= 14;
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
				break;
		}
	}

	h = Math.round((h * 60 + 360) % 360);
	const l = (max + min) / 2;
	const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

	return {
		h,
		s: Math.max(0, Math.min(100, Math.round(s * 100))),
		l: Math.max(0, Math.min(100, Math.round(l * 100))),
	};
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
	const hn = ((h % 360) + 360) % 360;
	const sn = Math.max(0, Math.min(100, s)) / 100;
	const ln = Math.max(0, Math.min(100, l)) / 100;

	if (sn === 0) {
		const gray = clampRgb(ln * 255);
		return { r: gray, g: gray, b: gray };
	}

	const c = (1 - Math.abs(2 * ln - 1)) * sn;
	const x = c * (1 - Math.abs(((hn / 60) % 2) - 1));
	const m = ln - c / 2;

	let r1 = 0;
	let g1 = 0;
	let b1 = 0;

	if (hn < 60) {
		r1 = c;
		g1 = x;
	} else if (hn < 120) {
		r1 = x;
		g1 = c;
	} else if (hn < 180) {
		g1 = c;
		b1 = x;
	} else if (hn < 240) {
		g1 = x;
		b1 = c;
	} else if (hn < 300) {
		r1 = x;
		b1 = c;
	} else {
		r1 = c;
		b1 = x;
	}

	return {
		r: clampRgb((r1 + m) * 255),
		g: clampRgb((g1 + m) * 255),
		b: clampRgb((b1 + m) * 255),
	};
}

function contrastRatio(
	a: { r: number; g: number; b: number },
	b: { r: number; g: number; b: number }
): number {
	const la = relativeLuminance(a);
	const lb = relativeLuminance(b);
	const lighter = Math.max(la, lb);
	const darker = Math.min(la, lb);
	return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
	const toLinear = (v: number): number => {
		const n = v / 255;
		return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
	};

	const r = toLinear(rgb.r);
	const g = toLinear(rgb.g);
	const b = toLinear(rgb.b);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function rgbToHex(r: number, g: number, b: number): string {
	const toHex = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
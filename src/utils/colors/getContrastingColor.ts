import { rgbToHex } from "./rgbToHex";

export function getContrastingColor(
  color: { r: number; g: number; b: number } | null
): string | null {
  if (!color) {
    return null;
  }
  let { r, g, b } = color;
  const r2 = (255 - r).toString(16);
  const g2 = (255 - g).toString(16);
  const b2 = (255 - b).toString(16);

  return rgbToHex({
    r: parseInt(r2, 16),
    g: parseInt(g2, 16),
    b: parseInt(b2, 16),
  });
}

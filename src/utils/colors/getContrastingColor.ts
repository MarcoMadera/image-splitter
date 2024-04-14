export function getContrastingColor(
  color: {
    r: number;
    g: number;
    b: number;
  } | null
): { r: number; g: number; b: number } | null {
  if (!color) {
    return null;
  }
  const contrastingR = 255 - color.r;
  const contrastingG = 255 - color.g;
  const contrastingB = 255 - color.b;

  return { r: contrastingR, g: contrastingG, b: contrastingB };
}

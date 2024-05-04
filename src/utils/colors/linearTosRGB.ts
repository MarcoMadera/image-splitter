export function linearTosRGB(value: number): number {
  let v = Math.max(0, Math.min(1, value));
  if (v <= 0.0031308) {
    return Math.trunc(v * 12.92 * 255 + 0.5);
  } else {
    return Math.trunc((1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255 + 0.5);
  }
}

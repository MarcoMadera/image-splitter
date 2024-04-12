export function oklchToRgb(L: number, C: number, H: number): number[] {
  H = (H * Math.PI) / 180;

  const a = C * Math.cos(H);
  const b = C * Math.sin(H);

  const Xn = 0.95047;
  const Yn = 1.0;
  const Zn = 1.08883;

  const Y = Yn * ((L + 16) / 116);
  const X = Xn * (a / 500 + (L + 16) / 116);
  const Z = Zn * ((L + 16) / 116 - b / 200);

  const Xr = X / Xn;
  const Yr = Y / Yn;
  const Zr = Z / Zn;

  let R = 3.2406 * Xr - 1.5372 * Yr - 0.4986 * Zr;
  let G = -0.9689 * Xr + 1.8758 * Yr + 0.0415 * Zr;
  let B = 0.0557 * Xr - 0.204 * Yr + 1.057 * Zr;

  R = R <= 0.0031308 ? 12.92 * R : 1.055 * Math.pow(R, 1 / 2.4) - 0.055;
  G = G <= 0.0031308 ? 12.92 * G : 1.055 * Math.pow(G, 1 / 2.4) - 0.055;
  B = B <= 0.0031308 ? 12.92 * B : 1.055 * Math.pow(B, 1 / 2.4) - 0.055;

  R = Math.round(R * 255);
  G = Math.round(G * 255);
  B = Math.round(B * 255);

  return [R, G, B];
}

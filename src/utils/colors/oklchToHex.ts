// eslint-disable-next-line import/no-extraneous-dependencies
import { SITE_DEFAULT_HUE } from "./../constants";
import { oklchToRgb } from "./oklchToRGB";
import { rgbToHex } from "./rgbToHex";

export function oklchToHex(oklch: string): string {
  const regex = /-?\d+(\.\d+)?/g;
  const matches = oklch.match(regex);
  if (!matches) return oklch;

  const [r, g, b] = oklchToRgb(
    Number(matches[0]),
    Number(matches[1]),
    SITE_DEFAULT_HUE
  );

  if (!r || !g || !b) return oklch;

  const newColor = rgbToHex({ r, g, b });

  if (!newColor) return oklch;

  return newColor;
}

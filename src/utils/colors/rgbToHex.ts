interface IHexToRgb {
  r: number;
  g: number;
  b: number;
}

export function rgbToHex(color: IHexToRgb | null): string | null {
  if (!color) {
    return null;
  }
  return (
    "#" +
    ((1 << 24) + (color.r << 16) + (color.g << 8) + color.b)
      .toString(16)
      .slice(1)
  );
}

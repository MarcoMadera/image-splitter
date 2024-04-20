export function getDominantColor(
  imageData: ImageData,
  samplePercentage: number = 0.1
): { r: number; g: number; b: number } | null {
  const data = imageData.data;
  const colorMap = new Map<string, number>();
  const { width, height } = imageData;

  const skipSize = Math.max(
    1,
    Math.floor(width * height * samplePercentage) * 4
  );

  for (let i = 0; i < data.length; i += skipSize) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = `${r},${g},${b}`;
    colorMap.set(key, (colorMap.get(key) ?? 0) + 1);
  }

  const sortedColorMap = new Map(
    [...colorMap.entries()].sort((a, b) => b[1] - a[1])
  );

  if (sortedColorMap.size === 0) {
    return null;
  }

  const dominantColor = sortedColorMap.keys().next().value as string;
  const [r, g, b] = dominantColor.split(",").map((color) => parseInt(color));

  if (r === undefined || g === undefined || b === undefined) {
    return null;
  }

  return { r, g, b };
}

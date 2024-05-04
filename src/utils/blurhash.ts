import { linearTosRGB, sRGBToLinear } from "./colors";
import { decode83 } from "./decode83";
import { generatePNG } from "./generatePNG";
import { getBase64PNG, uint8ArrayToString } from "./getBase64PNG";

function sign(n: number): 1 | -1 {
  return n < 0 ? -1 : 1;
}

function signPow(val: number, exp: number): number {
  return sign(val) * Math.pow(Math.abs(val), exp);
}

function decodeDC(value: number): number[] {
  const intR = value >> 16;
  const intG = (value >> 8) & 255;
  const intB = value & 255;
  return [sRGBToLinear(intR), sRGBToLinear(intG), sRGBToLinear(intB)];
}

function decodeAC(value: number, maximumValue: number): number[] {
  const quantR = Math.floor(value / (19 * 19));
  const quantG = Math.floor(value / 19) % 19;
  const quantB = value % 19;

  const rgb = [
    signPow((quantR - 9) / 9, 2.0) * maximumValue,
    signPow((quantG - 9) / 9, 2.0) * maximumValue,
    signPow((quantB - 9) / 9, 2.0) * maximumValue,
  ];

  return rgb;
}

function decodeBlurhash(
  blurhash: string,
  width: number,
  height: number
): Uint8ClampedArray {
  if (!blurhash || blurhash.length < 6) {
    throw new Error("The blurhash string must be at least 6 characters");
  }

  const sizeFlag = decode83(blurhash[0] as string);
  const numY = Math.floor(sizeFlag / 9) + 1;
  const numX = (sizeFlag % 9) + 1;

  const quantisedMaximumValue = decode83(blurhash[1] as string);
  const maximumValue = (quantisedMaximumValue + 1) / 166;

  const colors = new Array<number[]>(numX * numY);

  for (let i = 0; i < colors.length; i++) {
    if (i === 0) {
      const value = decode83(blurhash.substring(2, 6));
      colors[i] = decodeDC(value);
    } else {
      const value = decode83(blurhash.substring(4 + i * 2, 6 + i * 2));
      colors[i] = decodeAC(value, maximumValue);
    }
  }

  const bytesPerRow = width * 4;
  const pixels = new Uint8ClampedArray(bytesPerRow * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;

      for (let j = 0; j < numY; j++) {
        const basisY = Math.cos((Math.PI * y * j) / height);
        for (let i = 0; i < numX; i++) {
          const basis = Math.cos((Math.PI * x * i) / width) * basisY;
          const color = colors[i + j * numX];

          if (
            color?.[0] === undefined ||
            color[1] === undefined ||
            color[2] === undefined
          ) {
            throw new Error("Invalid color");
          }

          r += color[0] * basis;
          g += color[1] * basis;
          b += color[2] * basis;
        }
      }

      let intR = linearTosRGB(r);
      let intG = linearTosRGB(g);
      let intB = linearTosRGB(b);

      pixels[4 * x + 0 + y * bytesPerRow] = intR;
      pixels[4 * x + 1 + y * bytesPerRow] = intG;
      pixels[4 * x + 2 + y * bytesPerRow] = intB;
      pixels[4 * x + 3 + y * bytesPerRow] = 255;
    }
  }
  return pixels;
}

function parsePixels(pixels: Uint8ClampedArray, width: number, height: number) {
  const rgbaString = uint8ArrayToString(pixels);
  const pngString = generatePNG(width, height, rgbaString);
  const dataURL = getBase64PNG(pngString);
  return dataURL;
}

export function getBlurhashURL(
  blurhash: string,
  width: number,
  height: number
): string {
  try {
    const pixels = decodeBlurhash(blurhash, width, height);
    const dataURL = parsePixels(pixels, width, height);
    return dataURL;
  } catch (error) {
    console.error("Error decoding blurhash:", error);
    return "";
  }
}

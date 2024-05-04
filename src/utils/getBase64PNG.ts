export function stringToUint8Array(pngString: string): Uint8Array {
  const uInt8Array = new Uint8Array(pngString.length);
  for (let i = 0; i < pngString.length; i++) {
    uInt8Array[i] = pngString.charCodeAt(i);
  }
  return uInt8Array;
}

export function uint8ArrayToString(
  uInt8Array: Uint8Array | Uint8ClampedArray
): string {
  return String.fromCharCode.apply(null, Array.from(uInt8Array));
}

export function bufferToBase64PNG(buffer: ArrayBuffer | string): string {
  const isString = typeof buffer === "string";
  const uInt8Array = isString
    ? stringToUint8Array(buffer)
    : new Uint8Array(buffer);

  const base64String =
    typeof Buffer !== "undefined"
      ? Buffer.from(uInt8Array).toString("base64")
      : btoa(uint8ArrayToString(uInt8Array));

  return `data:image/png;base64,${base64String}`;
}

export function getBase64PNG(buffer?: string | ArrayBuffer | null): string {
  if (!buffer) {
    throw new Error("No buffer provided");
  }
  const base64PNG = bufferToBase64PNG(buffer);

  return base64PNG;
}

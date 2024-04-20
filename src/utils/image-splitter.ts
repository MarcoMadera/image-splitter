import JSZip from "jszip";
import type {
  IDownloadSplitImage,
  IDrawGrid,
  IDrawImageWithGrid,
} from "types/image-splitter";
import { loadImage, readFileData } from "utils";

import { getContrastingColor, getDominantColor, rgbToHex } from "./colors";
import {
  GRID_LINE_DASH_SCALE,
  GRID_LINE_TRANSPARENCY,
  GRID_LINE_WIDTH_SCALE,
} from "./constants";

export async function getSplittedFiles({
  gridX,
  gridY,
  img,
}: IDrawGrid): Promise<File[]> {
  const files: File[] = [];
  const bitmap = await createImageBitmap(img);
  const { width, height } = bitmap;

  const cellWidth = width / gridX;
  const cellHeight = height / gridY;

  if (cellWidth <= 1 || cellHeight <= 1) {
    throw new Error("Grid size too small");
  }

  const offScreenCanvas = new OffscreenCanvas(cellWidth, cellHeight);
  const ctx = offScreenCanvas.getContext("2d");
  if (!ctx) return [];

  const promises = Array.from({ length: gridX * gridY }, (_, i) => {
    const x = i % gridX;
    const y = Math.floor(i / gridX);
    ctx.drawImage(
      bitmap,
      x * cellWidth,
      y * cellHeight,
      cellWidth,
      cellHeight,
      0,
      0,
      cellWidth,
      cellHeight
    );
    return offScreenCanvas.convertToBlob().then((b) => {
      const fileName = `image_${x}_${y}.png`;
      const file = new File([b], fileName, { type: "image/png" });
      files.push(file);
    });
  });

  await Promise.all(promises);

  return files;
}

function arrayBufferToBase64PNG(arrayBuffer: ArrayBuffer) {
  const uInt8Array = new Uint8Array(arrayBuffer);
  const data = uInt8Array.reduce((d, byte) => {
    return d + String.fromCharCode(byte);
  }, "");
  const base64String = btoa(data);
  return `data:image/png;base64,${base64String}`;
}

function getBase64PNG(result?: FileReader["result"]): string {
  if (!result) return "";
  const isArrayBuffer = result instanceof ArrayBuffer;
  const base64PNG = isArrayBuffer ? arrayBufferToBase64PNG(result) : result;

  return base64PNG;
}

let cachedPaths = new Map<string, Path2D>();

export function clearPathCache(): void {
  cachedPaths = new Map();
}

function getCachedPath(
  gridX: number,
  gridY: number,
  width: number,
  height: number
): Path2D {
  const cacheKey = `${gridX},${gridY},${width},${height}`;
  if (!cachedPaths.has(cacheKey)) {
    const path = new Path2D();
    const cellWidth = width / gridX;
    const cellHeight = height / gridY;

    for (let i = 1; i <= Math.max(gridX, gridY); i++) {
      if (i < gridX) {
        path.moveTo(i * cellWidth, 0);
        path.lineTo(i * cellWidth, height);
      }
      if (i < gridY) {
        path.moveTo(0, i * cellHeight);
        path.lineTo(width, i * cellHeight);
      }
    }

    cachedPaths.set(cacheKey, path);
  }

  return cachedPaths.get(cacheKey) as Path2D;
}

export async function drawImageWithGrid({
  gridX,
  gridY,
  uploadedImageState,
  target,
}: IDrawImageWithGrid): Promise<void> {
  if (!uploadedImageState.file) {
    throw new Error("File not provided");
  }

  if (
    uploadedImageState.file instanceof File &&
    !uploadedImageState.file.type.startsWith("image")
  ) {
    throw new Error("Invalid file type");
  }

  const imageTarget = document.querySelector(target);

  if (!imageTarget) {
    throw new Error("Target not found");
  }

  const fileData = await readFileData(uploadedImageState.file);
  const base64PNG = getBase64PNG(fileData);
  const image = await loadImage(base64PNG);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  if (gridX <= 0 || gridY <= 0) {
    imageTarget.replaceChildren(canvas);
    throw new Error("Grid size cannot be 0");
  }

  const cellWidth = image.width / gridX;
  const cellHeight = image.height / gridY;

  if (cellWidth <= 1 || cellHeight <= 1) {
    imageTarget.replaceChildren(canvas);
    throw new Error("Grid size too small");
  }

  const imageData = ctx?.getImageData(0, 0, image.width, image.height);
  const contrastColor = rgbToHex(
    getContrastingColor(getDominantColor(imageData))
  );
  const lineWidth = Math.min(cellWidth, cellHeight) * GRID_LINE_WIDTH_SCALE;
  const dashLength = Math.max(cellHeight, cellHeight) * GRID_LINE_DASH_SCALE;
  ctx.setLineDash([dashLength, dashLength]);

  ctx.lineWidth = lineWidth;
  ctx.globalAlpha = GRID_LINE_TRANSPARENCY;
  ctx.strokeStyle = contrastColor ?? "red";

  const cachedPath = getCachedPath(gridX, gridY, image.width, image.height);
  ctx.stroke(cachedPath);

  imageTarget.replaceChildren(canvas);
}

export async function downloadSplitImage({
  gridX,
  gridY,
  uploadedImageState,
}: IDownloadSplitImage): Promise<void> {
  const zip = new JSZip();

  if (gridX <= 0 || gridY <= 0) {
    throw new Error("Grid size cannot be 0");
  }

  const fileData = await readFileData(uploadedImageState.file);

  const base64PNG = getBase64PNG(fileData);

  const img = await loadImage(base64PNG);

  const splittedImages = await getSplittedFiles({ img, gridX, gridY });

  splittedImages.forEach((file, index) => {
    const fileName = `${uploadedImageState.downloadName}_${index + 1}.png`;

    zip.file(fileName, file, {
      base64: true,
    });
  });

  const content = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(content);
  link.download = `${uploadedImageState.downloadName}.zip`;
  document.body.appendChild(link);
  link.click();

  setTimeout(function () {
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, 100);
}

export function removeFileExtension(fileName?: string): string {
  if (!fileName) {
    return "";
  }
  return fileName.replace(/\.[^/.]+$/, "");
}

export function getFileNameExtension(fileName?: string): string {
  if (!fileName) {
    return "";
  }
  return fileName.split(".").pop() ?? "";
}

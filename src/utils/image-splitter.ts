import JSZip from "jszip";
import type {
  IDownloadSplitImage,
  IDrawImageWithGrid,
  ISplitImageAndZip,
  IUploadedImageState,
} from "types/image-splitter";
import { getBase64PNG, loadImage, readFileData } from "utils";

import { getContrastingColor, getDominantColor } from "./colors";
import {
  GRID_LINE_DASH_SCALE,
  GRID_LINE_TRANSPARENCY,
  GRID_LINE_WIDTH_SCALE,
} from "./constants";

export async function splitImageAndZip({
  gridX,
  gridY,
  img,
  fileName,
}: ISplitImageAndZip): Promise<Blob> {
  const zip = new JSZip();
  const bitmap = await createImageBitmap(img);
  const { width, height } = bitmap;

  const cellWidth = width / gridX;
  const cellHeight = height / gridY;

  if (cellWidth <= 1 || cellHeight <= 1) {
    throw new Error("Grid size too small");
  }

  const offScreenCanvas = new OffscreenCanvas(cellWidth, cellHeight);
  const ctx = offScreenCanvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not found");
  }

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

    return offScreenCanvas.convertToBlob().then((blob) => {
      const resultFileName = `${fileName}_${gridX}x${gridY}_${x + 1}x${y + 1}.png`;
      const file = new File([blob], resultFileName, { type: "image/png" });
      zip.file(resultFileName, file, {
        base64: true,
      });
    });
  });

  await Promise.all(promises);
  const content = await zip.generateAsync({ type: "blob" });
  return content;
}

let cachedPaths = new Map<string, Path2D>();

function clearPathCache(): void {
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

let cachedImages = new Map<string, HTMLImageElement>();

function clearImageCache(): void {
  cachedImages = new Map();
}

export function clearGridImageCache(): void {
  clearPathCache();
  clearImageCache();
}

async function getCacheFileData(uploadedImageState: IUploadedImageState) {
  if (!cachedImages.has(uploadedImageState.name)) {
    const fileData = await readFileData(uploadedImageState.file);
    if (!fileData) throw new Error("File data not found");
    const base64PNG =
      fileData instanceof ArrayBuffer ? getBase64PNG(fileData) : fileData;
    const image = await loadImage(base64PNG);
    cachedImages.set(uploadedImageState.name, image);
  }

  return cachedImages.get(uploadedImageState.name) as HTMLImageElement;
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
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const blurHashURL = uploadedImageState.blurHashURL;
  if (blurHashURL) {
    const blurHashImage = await loadImage(blurHashURL);
    canvas.width = uploadedImageState.width ?? 180;
    canvas.height = uploadedImageState.height ?? 224;
    ctx.drawImage(blurHashImage, 0, 0, canvas.width, canvas.height);

    imageTarget.replaceChildren(canvas);
  }

  const image = await getCacheFileData(uploadedImageState);
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
  const contrastColor = getContrastingColor(getDominantColor(imageData));
  const lineWidth = Math.min(cellWidth, cellHeight) * GRID_LINE_WIDTH_SCALE;
  const dashLength = Math.max(cellHeight, cellHeight) * GRID_LINE_DASH_SCALE;
  ctx.setLineDash([dashLength, dashLength]);

  ctx.lineWidth = lineWidth;
  ctx.globalAlpha = GRID_LINE_TRANSPARENCY;
  ctx.strokeStyle = contrastColor ?? "red";
  ctx.globalCompositeOperation = "source-over";

  const cachedPath = getCachedPath(gridX, gridY, image.width, image.height);
  ctx.stroke(cachedPath);

  imageTarget.replaceChildren(canvas);
}

export async function downloadSplitImage({
  gridX,
  gridY,
  uploadedImageState,
}: IDownloadSplitImage): Promise<void> {
  if (gridX <= 0 || gridY <= 0) {
    throw new Error("Grid size cannot be 0");
  }

  const fileData = await readFileData(uploadedImageState.file);

  if (!fileData) {
    throw new Error("File data not found");
  }

  const base64PNG =
    fileData instanceof ArrayBuffer ? getBase64PNG(fileData) : fileData;

  const img = await loadImage(base64PNG);
  const fileName = uploadedImageState.downloadName.substring(0, 25);

  const zip = await splitImageAndZip({
    img,
    gridX,
    gridY,
    fileName,
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(zip);
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

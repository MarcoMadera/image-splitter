import JSZip from "jszip";
import type {
  IDownloadSplitImage,
  IDrawGrid,
  IGetSplitImages,
} from "types/image-splitter";

import { getContrastingColor, getDominantColor, rgbToHex } from "./colors";
import {
  GRID_LINE_DASH_SCALE,
  GRID_LINE_TRANSPARENCY,
  GRID_LINE_WIDTH_SCALE,
} from "./constants";

export function drawGrid({ gridX, gridY, img }: IDrawGrid): ImageData[] {
  const imageDataArray: ImageData[] = [];
  const { width, height } = img;

  const cellWidth = width / gridX;
  const cellHeight = height / gridY;

  for (let i = 0; i < gridX; i++) {
    for (let j = 0; j < gridY; j++) {
      const offScreenCanvas = new OffscreenCanvas(cellWidth, cellHeight);
      const ctx = offScreenCanvas.getContext("2d");
      if (!ctx) return [];
      ctx.drawImage(
        img,
        i * cellWidth,
        j * cellHeight,
        cellWidth,
        cellHeight,
        0,
        0,
        cellWidth,
        cellHeight
      );

      const imageData = ctx.getImageData(0, 0, cellWidth, cellHeight);
      imageDataArray.push(imageData);
    }
  }

  return imageDataArray;
}

function arrayBufferToBase64PNG(result: ArrayBuffer) {
  const uInt8Array = new Uint8Array(result);
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

export async function getSplitImages({
  gridX,
  gridY,
  uploadedImageState,
  target,
}: IGetSplitImages): Promise<ImageData[]> {
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

  imageTarget.innerHTML = "";

  const uploadImage = (result?: FileReader["result"]) =>
    new Promise<ImageData[]>((resolve, reject) => {
      const base64PNG = getBase64PNG(result);
      if (!base64PNG) {
        reject(new Error("Invalid file type"));
        return;
      }

      const img = new Image();
      const originalImage = new Image();

      img.src = base64PNG;
      originalImage.src = base64PNG;

      originalImage.onload = function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        ctx.drawImage(originalImage, 0, 0);
        const cellWidth = originalImage.width / gridX;
        const cellHeight = originalImage.height / gridY;
        const imageData = ctx?.getImageData(
          0,
          0,
          originalImage.width,
          originalImage.height
        );
        const contrastColor = rgbToHex(
          getContrastingColor(getDominantColor(imageData))
        );
        const lineWidth =
          Math.min(cellWidth, cellHeight) * GRID_LINE_WIDTH_SCALE;
        const dashLength =
          Math.max(cellHeight, cellHeight) * GRID_LINE_DASH_SCALE;
        ctx.setLineDash([dashLength, dashLength]);

        ctx.lineWidth = lineWidth;
        ctx.globalAlpha = GRID_LINE_TRANSPARENCY;
        ctx.strokeStyle = contrastColor ?? "red";

        for (let i = 1; i < gridX; i++) {
          ctx.beginPath();
          ctx.moveTo(i * cellWidth, 0);
          ctx.lineTo(i * cellWidth, originalImage.height);
          ctx.stroke();
        }

        for (let i = 1; i < gridY; i++) {
          ctx.beginPath();
          ctx.moveTo(0, i * cellHeight);
          ctx.lineTo(originalImage.width, i * cellHeight);
          ctx.stroke();
        }

        imageTarget.innerHTML = "";
        imageTarget.appendChild(canvas);
      };

      img.onload = function () {
        resolve(drawGrid({ img, gridX, gridY }));
      };
    });

  const reader = new FileReader();

  const splitImages = await new Promise<ImageData[]>((resolve, reject) => {
    if (uploadedImageState.file instanceof File) {
      reader.onload = (e: ProgressEvent<FileReader>) => {
        uploadImage(e.target?.result).then(resolve).catch(reject);
      };

      if (!uploadedImageState.file) {
        reject(new Error("File not found while reading file"));
        return;
      }
      reader.readAsDataURL(uploadedImageState.file);
      return;
    }

    uploadImage(uploadedImageState.file).then(resolve).catch(reject);
  });

  return splitImages;
}

export async function downloadSplitImage({
  outputName,
  splitImages,
}: IDownloadSplitImage): Promise<void> {
  const zip = new JSZip();

  if (!splitImages.length) {
    throw new Error("No split images found");
  }

  splitImages.forEach((imageData, index) => {
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d");

    ctx?.putImageData(imageData, 0, 0);

    const imgDataURL = canvas.toDataURL("image/png");

    const imgData = imgDataURL.split(",")[1];

    if (!imgData) {
      throw new Error("Invalid image data");
    }

    zip.file(`${outputName}_${index + 1}.png`, imgData, {
      base64: true,
    });
  });

  const content = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(content);
  link.download = `${outputName}.zip`;
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

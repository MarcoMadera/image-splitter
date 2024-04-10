import JSZip from "jszip";

interface IDrawGrid {
  img: HTMLImageElement;
  gridX: IGetSplitImages["gridX"];
  gridY: IGetSplitImages["gridY"];
}

export function drawGrid({
  gridX,
  gridY,
  img,
}: IDrawGrid): HTMLCanvasElement[] {
  const canvasArray: HTMLCanvasElement[] = [];
  const { width, height } = img;

  const cellWidth = width / gridX;
  const cellHeight = height / gridY;

  for (let i = 0; i < gridX; i++) {
    for (let j = 0; j < gridY; j++) {
      const canvas = document.createElement("canvas");
      canvas.width = cellWidth;
      canvas.height = cellHeight;
      const ctx = canvas.getContext("2d");
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
      canvasArray.push(canvas);
    }
  }

  return canvasArray;
}

interface IGetSplitImages {
  gridX: number;
  gridY: number;
  file: File | undefined;
  target: string;
}

export async function getSplitImages({
  gridX,
  gridY,
  file,
  target,
}: IGetSplitImages): Promise<HTMLCanvasElement[]> {
  if (!file) {
    throw new Error("File not provided");
  }

  if (!file.type.startsWith("image")) {
    throw new Error("Invalid file type");
  }

  const imageTarget = document.querySelector(target);

  if (!imageTarget) {
    throw new Error("Target not found");
  }

  const reader = new FileReader();

  const splitImages = await new Promise<HTMLCanvasElement[]>(
    (resolve, reject) => {
      reader.onload = function (e: ProgressEvent<FileReader>) {
        const fileResult = e.target?.result;
        if (!fileResult) {
          reject(new Error("Invalid file type"));
          return;
        }

        if (
          typeof fileResult === "string" &&
          !fileResult.startsWith("data:image")
        ) {
          reject(new Error("Invalid file type transformation"));
          return;
        }

        const img = new Image();
        const originalImage = new Image();

        img.src = e.target?.result as string;
        originalImage.src = e.target?.result as string;
        imageTarget.innerHTML = "";

        originalImage.onload = function () {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          canvas.width = originalImage.width;
          canvas.height = originalImage.height;
          ctx.drawImage(originalImage, 0, 0);
          const cellWidth = originalImage.width / gridX;
          const cellHeight = originalImage.height / gridY;
          ctx.strokeStyle = "red";

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

          imageTarget.appendChild(canvas);
        };

        img.onload = function () {
          resolve(drawGrid({ img, gridX, gridY }));
        };
      };

      reader.readAsDataURL(file);
    }
  );

  return splitImages;
}

interface IDownloadSplitImage {
  gridX: IGetSplitImages["gridX"];
  gridY: IGetSplitImages["gridY"];
  splitImages: HTMLCanvasElement[];
}

export function downloadSplitImage({
  gridX,
  gridY,
  splitImages,
}: IDownloadSplitImage): void {
  const zip = new JSZip();
  const imgName = "split_image";

  if (!splitImages.length) {
    throw new Error("No split images found");
  }

  splitImages.forEach((canvas, index) => {
    const imgDataURL = canvas.toDataURL("image/png");
    const imgData = imgDataURL.split(",")[1];

    if (!imgData) {
      throw new Error("Invalid image data");
    }

    zip.file(`${imgName}_${index + 1}.png`, imgData, {
      base64: true,
    });
  });

  zip.generateAsync({ type: "blob" }).then(function (content) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `${imgName}_grid_${gridX}x${gridY}.zip`;
    document.body.appendChild(link);
    link.click();

    setTimeout(function () {
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }, 100);
  });
}

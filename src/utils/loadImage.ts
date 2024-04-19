export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = src;
    image.crossOrigin = "Anonymous";
    image.onerror = () => {
      reject(new Error("Invalid file"));
    };

    image.onload = () => {
      resolve(image);
    };
  });
}

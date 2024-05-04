import { type PropsWithChildren, type ReactElement, useState } from "react";

import type { Images } from "types/imagesResponse";
import { getImages } from "utils/apiCalls";

import ImageCard from "./ImageCard";

interface IImagesWrapper {
  title: string;
  images?: Images | null;
  reloadIcon?: ReactElement;
}

function ImagesWrapper({
  title,
  images: imagesProps,
  children,
  reloadIcon,
}: Readonly<PropsWithChildren<IImagesWrapper>>): ReactElement {
  const [images, setImages] = useState<Images | null | undefined>(imagesProps);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function handleReload() {
    if (isLoading) return;

    setIsLoading(true);

    getImages()
      .then((imagesRes) => {
        setImages(imagesRes);
      })
      .catch((err) => {
        console.error("Error getting images:", err);
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <div className="container relative grid min-h-[39rem] min-w-full grid-cols-1 px-4 pb-1 pt-4">
      <h2 className="mb-1 text-2xl font-bold dark:text-neutral-50">{title}</h2>
      <div
        id="explore-image-container"
        className="flex flex-wrap justify-center gap-2 py-2"
      >
        {images?.length
          ? images?.map((image) => <ImageCard image={image} key={image.id} />)
          : children}
      </div>

      <footer className="flex flex-col items-end justify-end">
        <button
          // eslint-disable-next-line tailwindcss/no-custom-classname
          className="btn-plain tabbable disabled:text-opacity/60 disabled:bg-opacity/60 mt-1 inline-flex cursor-pointer items-center justify-center rounded-lg px-2 py-1 transition-[transform,background-color] duration-100 active:scale-105 disabled:!cursor-not-allowed"
          onClick={handleReload}
          disabled={isLoading}
          type="button"
          aria-label="Reload images"
          title="Reload images"
        >
          {reloadIcon ?? "Reload"}
        </button>
      </footer>
    </div>
  );
}

export default ImagesWrapper;

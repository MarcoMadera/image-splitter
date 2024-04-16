import { type PropsWithChildren, type ReactElement, useState } from "react";

import type { Images } from "types/imagesResponse";
import { getImages } from "utils/apiCalls";

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
        localStorage.setItem("images", JSON.stringify(imagesRes));
        setImages(imagesRes);
      })
      .catch((err) => {
        console.error("Error getting images:", err);
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <div className="container relative grid min-h-[39rem] grid-cols-1 px-4 pb-1 pt-4">
      <h2 className="mb-1 text-2xl font-bold dark:text-neutral-50">{title}</h2>
      <div
        id="explore-image-container"
        className="flex flex-wrap justify-center gap-2 py-2"
      >
        {images?.length
          ? images?.map((image) => (
              <button
                key={image.id}
                id={image.id}
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", image.id);
                }}
                className="group relative h-56 rounded shadow transition hover:z-10 hover:scale-125 hover:shadow-lg motion-reduce:hover:scale-105"
              >
                <img
                  src={image.urls.small_s3 ?? image.urls.small}
                  alt={image.alt_description}
                  className="h-full object-cover"
                  width={180}
                  height={120}
                  loading="eager"
                />
                <div className="absolute left-0 top-0 flex size-full flex-col items-start justify-end bg-black/25 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <p
                    className="mb-2 line-clamp-2 justify-start text-ellipsis text-left text-xs text-white opacity-90"
                    title={image.description ?? ""}
                  >
                    {image.description}
                  </p>
                  <a
                    href={image.user.links.html}
                    className="z-20 font-semibold text-white"
                    target="_blank"
                  >
                    <img
                      src={image.user.profile_image.medium}
                      className="mr-1 inline-block h-8 rounded-full"
                      alt={image.user.first_name}
                      width={32}
                      height={32}
                      loading="eager"
                    />
                    {image.user.first_name}
                  </a>
                </div>
              </button>
            ))
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
        >
          {reloadIcon ?? "Reload"}
        </button>
      </footer>
    </div>
  );
}

export default ImagesWrapper;

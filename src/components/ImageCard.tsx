import { type ReactElement, useState } from "react";

import type { IUploadedImageState } from "types/image-splitter";
import type { Image } from "types/imagesResponse";
import { getBlurhashURL } from "utils";

interface IImageCard {
  image: Image;
}

function ImageCard({ image }: Readonly<IImageCard>): ReactElement {
  const [hasFocus, setHasFocus] = useState<boolean>(false);
  const blurHashURL = getBlurhashURL(image.blur_hash, 90, 112);

  const imageDetails: IUploadedImageState = {
    file: image.urls.regular,
    name: image.slug,
    extension: "",
    downloadName: "",
    blurHashURL: blurHashURL,
    width: image.width,
    height: image.height,
  };

  function handleImageClick() {
    if (image.urls.regular) {
      window.dispatchEvent(
        new CustomEvent<IUploadedImageState>("updateImageState", {
          detail: imageDetails,
        })
      );
    }
  }

  function handleDrag(e: React.DragEvent<HTMLButtonElement>) {
    e.dataTransfer.setData("application/json", JSON.stringify(imageDetails));
  }

  return (
    <button
      key={image.id}
      id={image.id}
      draggable={true}
      onDragStart={handleDrag}
      onClick={handleImageClick}
      onFocus={(e) => {
        e.currentTarget.classList.add("z-10", "scale-105", "shadow-lg");
        setHasFocus(true);
      }}
      onBlur={(e) => {
        e.currentTarget.classList.remove("z-10", "scale-105", "shadow-lg");
        setHasFocus(false);
      }}
      title={`Select image to upload: ${image.alt_description}`}
      className="group relative h-56 rounded shadow transition hover:z-10 hover:scale-125 hover:shadow-lg motion-reduce:hover:scale-105"
    >
      <img
        src={image.urls.small_s3 ?? image.urls.small}
        alt={image.alt_description}
        className="h-full object-cover"
        width={180}
        height={224}
        loading="eager"
        style={{
          backgroundSize: "cover",
          backgroundImage: `url(${blurHashURL})`,
          backgroundColor: image.color,
        }}
      />
      <div
        className={`${hasFocus ? "opacity-100" : "opacity-0"} absolute left-0 top-0 flex size-full flex-col items-start justify-end bg-black/25 p-2 transition-opacity group-hover:opacity-100`}
      >
        <p
          className="mb-2 line-clamp-2 w-full justify-start text-ellipsis text-left text-xs text-white"
          title={image.description ?? ""}
        >
          {image.description}
        </p>
        <a
          href={image.user.links.html}
          className="z-20 flex items-center text-left font-semibold text-white"
          target="_blank"
          rel="noreferrer"
          title={image.user.first_name}
        >
          <img
            src={image.user.profile_image.medium}
            className="mr-1 inline-block size-8 rounded-full"
            alt={image.user.first_name}
            width={32}
            height={32}
            loading="eager"
          />
          <span>{image.user.first_name}</span>
        </a>
      </div>
    </button>
  );
}

export default ImageCard;

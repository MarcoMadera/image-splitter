import type { IUploadedImageState } from "types/image-splitter";

export async function readFileData(
  file: IUploadedImageState["file"]
): Promise<FileReader["result"] | undefined> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    if (file instanceof File) {
      reader.onload = (e: ProgressEvent<FileReader>) => {
        resolve(e.target?.result);
      };

      if (!file) {
        reject(new Error("File not found while reading file"));
        return;
      }

      reader.readAsDataURL(file);
    } else {
      resolve(file);
    }
  });
}

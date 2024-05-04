export interface IUploadedImageState {
  file: File | string | null;
  name: string;
  downloadName: string;
  extension: string;
  blurHashURL?: string;
  width?: number;
  height?: number;
}

export interface IDrawImageWithGrid {
  gridX: number;
  gridY: number;
  uploadedImageState: IUploadedImageState;
  target: string;
}

export interface ISplitImageAndZip {
  img: HTMLImageElement;
  gridX: IDrawImageWithGrid["gridX"];
  gridY: IDrawImageWithGrid["gridY"];
  fileName: string;
}

export interface IDownloadSplitImage {
  gridX: number;
  gridY: number;
  uploadedImageState: IUploadedImageState;
}

export interface IUploadedImageState {
  file: File | string | null;
  name: string;
  downloadName: string;
  extension: string;
}

export interface IDrawImageWithGrid {
  gridX: number;
  gridY: number;
  uploadedImageState: IUploadedImageState;
  target: string;
}

export interface IDrawGrid {
  img: HTMLImageElement;
  gridX: IDrawImageWithGrid["gridX"];
  gridY: IDrawImageWithGrid["gridY"];
}

export interface IDownloadSplitImage {
  gridX: number;
  gridY: number;
  uploadedImageState: IUploadedImageState;
}

export interface IUploadedImageState {
  file: File | string | null;
  name: string;
  extension: string;
}

export interface IGetSplittedImages {
  gridX: number;
  gridY: number;
  uploadedImageState: IUploadedImageState;
  target: string;
}

export interface IDrawGrid {
  img: HTMLImageElement;
  gridX: IGetSplittedImages["gridX"];
  gridY: IGetSplittedImages["gridY"];
}

export interface IDownloadSplitImage {
  outputName: string;
  splittedImages: File[];
}

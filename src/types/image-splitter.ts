export interface IUploadedImageState {
  file: File | string | null;
  name: string;
  extension: string;
}

export interface IGetSplitImages {
  gridX: number;
  gridY: number;
  uploadedImageState: IUploadedImageState;
  target: string;
}

export interface IDrawGrid {
  img: HTMLImageElement;
  gridX: IGetSplitImages["gridX"];
  gridY: IGetSplitImages["gridY"];
}

export interface IDownloadSplitImage {
  outputName: string;
  splitImages: HTMLCanvasElement[];
}

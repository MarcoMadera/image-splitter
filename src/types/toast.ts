export enum ToastTypes {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

export interface ToastOptions {
  message: string;
  type?: ToastTypes;
  location?:
    | "top-right"
    | "top-center"
    | "top-left"
    | "bottom-right"
    | "bottom-center"
    | "bottom-left";
}

export interface WrapperProps {
  options: WrapperOptions;
  toast: (toast: ToastOptions) => void;
  timers: Record<string, NodeJS.Timeout>;
}

export interface WrapperOptions {
  maxToasts: number;
  toastLife: number;
  currentToasts: number;
  stackedToasts: boolean;
}

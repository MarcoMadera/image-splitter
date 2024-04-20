/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { ToastOptions } from "types/toast";

declare global {
  interface Window {
    toast: (options: ToastOptions) => void;
  }
}

export * from "./blue";
export * from "./default";

import { blue } from "./blue";

export const allThemes = [blue];

export const safeThemeList = allThemes
  .flatMap((v) => v.selectors)
  .filter((v) => v.startsWith("."))
  .map((v) => v.slice(1));

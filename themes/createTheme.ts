import type { DeepPartial } from "astro/dist/type-utils";

import type { defaultTheme } from "./default";

export interface Theme {
  name: string;
  extend: DeepPartial<(typeof defaultTheme)["extend"]>;
}

export function createTheme(theme: Theme): {
  name: string;
  selectors: string[];
  extend: DeepPartial<(typeof defaultTheme)["extend"]>;
} {
  return {
    name: theme.name,
    selectors: [`.theme-${theme.name}`],
    extend: theme?.extend,
  };
}

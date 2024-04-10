import tailwingScrollbar from "tailwind-scrollbar";
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import type { PluginCreator } from "tailwindcss/types/config";
import themer from "tailwindcss-themer";

import { allThemes, defaultTheme, safeThemeList } from "./themes";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,astro}"],
  safelist: safeThemeList,
  theme: {
    extend: {
      screens: {
        ssm: "400px",
      },

      fontFamily: {
        "open-sans": "'Open Sans'",
      },

      keyframes: {
        "loading-pin": {
          "0%, 40%, 100%": { height: "0.5em", "background-color": "#282336" },
          "20%": { height: "1em", "background-color": "white" },
        },
      },
      animation: { "loading-pin": "loading-pin 1.8s ease-in-out infinite" },
    },
  },
  plugins: [
    tailwingScrollbar,
    themer({
      defaultTheme: defaultTheme,
      themes: [
        {
          name: "default",
          selectors: [".theme-default"],
          ...defaultTheme,
        },
        ...allThemes,
      ],
    }),
    plugin(({ addVariant }) => {
      addVariant("dir-neutral", "[dir] &");
    }),
  ] as (PluginCreator | { handler: PluginCreator; config?: Partial<Config> })[],
};

export default config;

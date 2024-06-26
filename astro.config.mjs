import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import swup from "@swup/astro";
import { defineConfig } from "astro/config";
import icon from "astro-icon";

import { oklchToHex } from "./src/utils/colors/oklchToHex";

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind(),
    swup({
      theme: false,
      animationClass: "transition-",
      containers: ["#swup-main-content"],
      smoothScrolling: true,
      cache: true,
      preload: true,
      accessibility: true,
      globalInstance: true,
    }),
    icon({
      include: {
        "material-symbols": ["*"],
        "fa6-brands": ["*"],
        "fa6-regular": ["*"],
        "fa6-solid": ["*"],
        ep: [
          "success-filled",
          "circle-close-filled",
          "warn-triangle-filled",
          "info-filled",
        ],
        mage: ["reload"],
      },
    }),
  ],
  adapter: vercel(),
  output: "server",
  vite: {
    css: {
      preprocessorOptions: {
        stylus: {
          define: {
            oklchToHex: (value) => oklchToHex(value.string),
          },
        },
      },
    },
  },
});

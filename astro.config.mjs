// import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import swup from "@swup/astro";
import { defineConfig, passthroughImageService } from "astro/config";
import icon from "astro-icon";

import { oklchToHex } from "./src/utils/colors/oklchToHex";

// https://astro.build/config
export default defineConfig({
  integrations: [
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
      },
    }),
  ],
  image: {
    domains: ["images.unsplash.com"],
    service: passthroughImageService(),
  },
  output: "server",
  adapter: vercel(),
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

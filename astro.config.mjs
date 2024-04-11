// import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { defineConfig, passthroughImageService } from "astro/config";

export default defineConfig({
  integrations: [tailwind()],
  image: {
    domains: ["images.unsplash.com"],
    service: passthroughImageService(),
  },
});

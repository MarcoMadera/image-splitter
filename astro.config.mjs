// import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import { defineConfig, passthroughImageService } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  image: {
    domains: ["images.unsplash.com"],
    service: passthroughImageService(),
  },
  output: "server",
  adapter: vercel(),
});

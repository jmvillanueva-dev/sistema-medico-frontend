// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import path from "path";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: "server",
  adapter: vercel(),
  vite: {
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },

    plugins: [tailwindcss()],
  },
});
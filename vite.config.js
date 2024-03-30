import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve, parse } from "path";
import * as fs from "fs";
import svgr from "vite-plugin-svgr";

const rootPaths = fs.readdirSync("src").reduce((out, item) => {
  const parsed = parse(item);
  return { ...out, [parsed.name]: resolve("src", item) };
}, {});

export default defineConfig({
  plugins: [svgr(), react()],

  build: {
    outDir: "build",
    chunkSizeWarningLimit: 1600,
  },
  server: {
    port: 3000,
    open: true, // this will open directly to your browser
  },
  resolve: {
    alias: rootPaths,
  },
});

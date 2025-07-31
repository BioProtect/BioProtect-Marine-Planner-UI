import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // depending on your application, base can also be "/"
  base: "/",
  plugins: [
    react(),
    svgr({
      include: "**/*.svg?react",
    }),
  ],
  resolve: {
    alias: {
      "@slices": path.resolve(__dirname, "./src/slices"),
      "@planningGrids": path.resolve(__dirname, "./src/planningGrids"),
      "@projects": path.resolve(__dirname, "./src/projects"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@navbars": path.resolve(__dirname, "./src/navbars"),
      "@images": path.resolve(__dirname, "./src/images"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      // You can add more aliases as needed
    },
  },
  server: {
    // this ensures that the browser opens upon server start
    open: true,
    // this sets a default port to 4500
    port: 4500,
  },
  build: {
    outDir: "build",
  },
});

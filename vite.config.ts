import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = __dirname;

export default defineConfig({
  base: "./",
  plugins: [
    tsconfigPaths({
      projects: [path.resolve(projectRoot, "tsconfig.app.json")],
    }),
    react(),
  ],
  server: {
    port: 8080,
    strictPort: true,
  },
  root: projectRoot,
});


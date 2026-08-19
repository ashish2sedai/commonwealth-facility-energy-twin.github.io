import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const [owner, repository] = (process.env.GITHUB_REPOSITORY ?? "").split("/");
const isRootPagesSite = Boolean(owner && repository === `${owner}.github.io`);
const base = isRootPagesSite ? "/" : repository ? `/${repository}/` : "/";

export default defineConfig({
  base,
  plugins: [react()],
  build: { outDir: "dist", emptyOutDir: true },
});

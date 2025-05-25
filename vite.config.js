import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import jsconfigpaths from "vite-jsconfig-paths"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), jsconfigpaths()],
})

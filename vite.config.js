import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import jsconfigpaths from "vite-jsconfig-paths"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), jsconfigpaths()],
   server: {
    host: '0.0.0.0', // binds to all IPs
    port: 5173,       // or any open port
    allowedHosts: ["wallpaper-launch-reward-pmc.trycloudflare.com","kernn.feedbazaar.in","web.kernn.xyz"]
  }
})

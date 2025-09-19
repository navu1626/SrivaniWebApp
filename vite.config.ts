import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv runs in Node and returns env vars prefixed with VITE_
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const base = (env.VITE_BASE as string) || '/';
  return {
    base,
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    assetsInclude: ['**/*.JPG'],
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      open: true,
    },
  };
});

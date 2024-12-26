import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

const resolve = () => {
  return {
    '@': path.resolve(__dirname, 'src'),
  };
};

export default defineConfig({
  base: "/jsontots/",
  build: {
    outDir: 'docs'
  },
  resolve: {
    alias: resolve(),
  },
  plugins: [vue()],
  define: {
    'process.env': { ...process.env },
  },
});

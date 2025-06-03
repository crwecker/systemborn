import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    reactRouter(),
    tsconfigPaths(),
  ],
  build: {
    commonjsOptions: {
      include: [/@fsoc\/royalroadl-api/, /node_modules/],
      transformMixedEsModules: true
    }
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
});

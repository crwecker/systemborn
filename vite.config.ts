import { defineConfig } from 'vite';
import { vitePlugin as remix } from '@remix-run/dev';
import tsconfigPaths from 'vite-tsconfig-paths';

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  optimizeDeps: {
    include: ['@fsoc/royalroadl-api']
  },
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

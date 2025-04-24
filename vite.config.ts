import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        middleware: resolve(__dirname, 'src/middleware/index.ts'),
      },
      formats: ['es'],
      fileName: (format, entryName) =>
        entryName === 'middleware' ? 'middleware/index.js' : '[name].js',
    },
    rollupOptions: {
      external: ['react', 'zustand', /^zustand\/.*/, /^react\/.*/],
      output: {
        assetFileNames: 'assets/[name][extname]',
        globals: {
          react: 'React',
          zustand: 'zustand',
        },
        preserveModules: false,
      },
    },
    target: 'es2020',
    sourcemap: false,
    emptyOutDir: true,
  },
});

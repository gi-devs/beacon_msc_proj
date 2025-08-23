import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['cjs'],
  outDir: 'dist',
  bundle: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [],
  noExternal: ['@beacon/utils', '@beacon/validation', '@beacon/types'],
});

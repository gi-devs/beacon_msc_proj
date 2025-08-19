import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  outDir: 'dist',
  bundle: true,
  sourcemap: true,
  dts: true,
  clean: true,
});

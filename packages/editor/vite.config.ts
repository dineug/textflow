import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// import typescript from '@rollup/plugin-typescript';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';

const pkg = JSON.parse(readFileSync('package.json', { encoding: 'utf8' }));

const banner = `/*!
 * ${pkg.name}
 * @version ${pkg.version}
 * @author ${pkg.author}
 * @license ${pkg.license}
 */`;

const external = new RegExp(
  `^(${Object.keys({
    ...pkg.peerDependencies,
    ...pkg.dependencies,
  }).join('|')})(?:/.+)*$`
);

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';

  return {
    define: {},
    // Vite 7 changed the esbuild default to strip legal comments; keep them
    // inline so the rollupOptions.output.banner license header is preserved.
    esbuild: { legalComments: 'inline' },
    build: {
      lib: {
        entry: './src/index.ts',
        fileName: () => 'index.js',
        formats: ['es'],
      },
      rollupOptions: {
        external,
        output: { banner },
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    plugins: [
      isBuild && dts(),
      // https://github.com/vanilla-extract-css/vanilla-extract/issues/1408
      // isBuild && typescript({ noEmitOnError: true, noForceEmit: true }),
      vanillaExtractPlugin() as Plugin,
      react(),
    ].filter(Boolean),
    server: {
      open: true,
    },
  };
});

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import typescript from '@rollup/plugin-typescript';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import dts from 'vite-plugin-dts';

const pkg = JSON.parse(readFileSync('package.json', { encoding: 'utf8' }));

const banner = `/*!
 * ${pkg.name}
 * @version ${pkg.version} | ${new Date().toDateString()}
 * @author ${pkg.author}
 * @license ${pkg.license}
 */`;

const external = new RegExp(
  `^(${Object.keys({
    ...pkg.peerDependencies,
    ...pkg.dependencies,
  }).join('|')})$`
);

export default defineConfig(({ command, mode }) => {
  const envDir = './environment';
  const env = loadEnv(mode, envDir);
  const isServe = command === 'serve';
  const isBuild = command === 'build';

  return {
    envDir,
    define: {},
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
        '@': join(__dirname, 'src'),
      },
    },
    plugins: [
      isBuild && dts(),
      isBuild && typescript({ noEmitOnError: true, noForceEmit: true }),
      react(),
    ].filter(Boolean),
    server: {
      open: true,
    },
  };
});

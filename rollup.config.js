import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';
import { dirname } from 'path';

function getOutput(format = 'esm') {
  if (format === 'esm') {
    return { dir: dirname(pkg.module), format };
  }

  return { file: pkg.main, format };
}

function getPlugins(format = 'esm') {
  const typeScriptOptions =
    format === 'esm'
      ? { declaration: true, declarationDir: dirname(pkg.module) }
      : {};

  return [typescript(typeScriptOptions), terser()];
}

const input = 'src/ape.ts';

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

export default [
  {
    input,
    output: getOutput('cjs'),
    plugins: getPlugins('cjs'),
    external,
  },
  {
    input,
    output: getOutput('esm'),
    plugins: getPlugins('esm'),
    external,
  },
];

import babel, { getBabelOutputPlugin } from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
const path = require('path');
const nodeResolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const pkg = require('./package.json');

const resolve = function (...args) {
  return path.resolve(__dirname, ...args);
};
const extensions = ['.js'];

module.exports = {
  input: resolve('./src/index.ts'),
  output: [
    { file: './lib/index.cjs.js', format: 'cjs' },
    { file: './lib/index.esm.js', format: 'esm' },
  ],
  plugins: [
    typescript({
      tsconfigOverride: { compilerOptions: { module: 'es2015' } },
    }),
    nodeResolve({ extensions }),
    commonjs(),
    babel({
      extensions,
      babelHelpers: 'runtime',
      exclude: 'node_modules/**', // 只编译我们的源代码
    }),
    getBabelOutputPlugin({ presets: [['@babel/preset-env', { modules: false }]] }),
  ],
};

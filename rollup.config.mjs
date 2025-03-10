import alias from '@rollup/plugin-alias'
import { babel } from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import image from '@rollup/plugin-image'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import del from 'rollup-plugin-delete'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'

import postcss from 'rollup-plugin-postcss'

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'esm',
      inlineDynamicImports: true,
    },
    external: ['antd', '@ant-design/cssinjs', 'react', 'react-dom'],
    plugins: [
      alias({
        entries: [{ find: '@', replacement: './src' }]
      }),
      del({ targets: 'dist/*' }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**'
      }),
      peerDepsExternal(),
      resolve({
        extensions: ['.js', '.jsx']
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        include: ['src/**/*.{ts,tsx}']
      }),
      json(),
      postcss({ minimize: true }),
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true
        },
        output: {
          comments: false
        }
      }),
      image()
    ],
    watch: {
      include: 'src/**' // отслеживать изменения в src
    }
  }
]

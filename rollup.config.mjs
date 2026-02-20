import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import image from '@rollup/plugin-image'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { createRequire } from 'node:module'
import del from 'rollup-plugin-delete'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'

import postcss from 'rollup-plugin-postcss'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')

const dependencyNames = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {})
])
const buildSourceMap = process.env.BUILD_SOURCEMAP !== 'false'

const isExternal = (id) => {
  if (id.startsWith('.') || id.startsWith('/')) {
    return false
  }

  for (const dep of dependencyNames) {
    if (id === dep || id.startsWith(`${dep}/`)) {
      return true
    }
  }

  return false
}

export default [
  {
    input: {
      index: 'src/index.ts',
      admin: 'src/entries/admin.ts',
      utils: 'src/entries/utils.ts',
      hooks: 'src/entries/hooks.ts'
    },
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        sourcemap: buildSourceMap,
        entryFileNames: 'cjs/[name].js',
        chunkFileNames: 'cjs/chunks/[name]-[hash].js',
        exports: 'named'
      },
      {
        dir: 'dist',
        format: 'esm',
        sourcemap: buildSourceMap,
        entryFileNames: 'esm/[name].js',
        chunkFileNames: 'esm/chunks/[name]-[hash].js'
      }
    ],
    external: isExternal,
    plugins: [
      del({ targets: 'dist/*' }),
      peerDepsExternal(),
      resolve({
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        preferBuiltins: false
      }),
      commonjs(),
      json(),
      image(),
      postcss({
        extract: false,
        minimize: true,
        inject: true,
        use: {
          sass: {
            silenceDeprecations: ['legacy-js-api']
          }
        }
      }),
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: buildSourceMap,
        inlineSources: buildSourceMap
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }),
      terser({
        maxWorkers: 1,
        compress: {
          drop_console: ['log', 'info'],
          drop_debugger: true
        },
        output: {
          comments: false
        }
      })
    ]
  }
]

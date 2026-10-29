import type { StorybookConfig } from '@storybook/react-vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import remarkGfm from 'remark-gfm'

const config: StorybookConfig = {
  stories: ['../src/stories/**/*.mdx', '../src/stories/**/*.stories.tsx'],
  async viteFinal(config) {
    const { mergeConfig } = await import('vite')
    const root = process.cwd()
    const tsconfig = JSON.parse(
      readFileSync(resolve(root, 'tsconfig.json'), 'utf8')
    )
    const paths: Record<string, string[]> = tsconfig.compilerOptions.paths
    const alias = Object.fromEntries(
      Object.entries(paths).map(([name, [target]]) => [
        name.replace(/\/\*$/, ''),
        resolve(root, target.replace(/\/\*$/, ''))
      ])
    )
    return mergeConfig(config, {
      resolve: { alias },
      css: { preprocessorOptions: { scss: { loadPaths: [root] } } }
    })
  },
  addons: [
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm]
          }
        }
      }
    }
  ],
  framework: '@storybook/react-vite'
}

export default config

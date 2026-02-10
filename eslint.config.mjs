import eslint from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';










/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: globals.browser
    }
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  {
    rules: {
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'import/default': 'off',
      'import/no-named-as-default': 'off',
      'prettier/prettier': 'off',
      'quotes': ['error', 'single'],
      'react/jsx-one-expression-per-line': 'off',
      'react/prop-types': 0,
      'react/react-in-jsx-scope': 'off',
      'semi': ['error', 'never'],
      '@typescript-eslint/no-unused-vars': ['off'],
      '@typescript-eslint/no-non-null-assertion': ['off'],
      'import/no-unresolved': 'error',
      'no-unused-vars': 'off'
    }
  },
  {
    ignores: [
      '**/ReactJsonView/*',
      '**/stories/*',
      'babel.config.js',
      'eslint.config.mjs',
      '.prettierrc.js',
      '.storybook',
      'dist',
      'rollup.config.mjs'
    ]
  }
]

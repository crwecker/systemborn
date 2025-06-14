import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended, 
      ...tseslint.configs.recommended,
      'prettier'
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Disable semicolons
      'semi': ['error', 'never'],
      '@typescript-eslint/semi': ['error', 'never'],
      // Enforce React strict mode
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+
      'react/jsx-uses-react': 'off', // Not needed with React 17+
      'react/jsx-uses-vars': 'error',
      'react/jsx-fragments': ['error', 'syntax'],
      'react/jsx-no-undef': 'error',
      'react/jsx-key': 'error',
      'react/no-unknown-property': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-bind': ['warn', { allowArrowFunctions: true }],
      'react/no-direct-mutation-state': 'error',
      'react/no-array-index-key': 'warn',
    },
  },
)

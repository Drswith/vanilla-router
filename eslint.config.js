import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
    ignores: [
      'src/**/*.html',
      '**/*.{test,spec}.{js,ts}',
      '**/coverage/**',
    ],
  },
  {
    rules: {
      'no-console': 'off',
    },
  },
)

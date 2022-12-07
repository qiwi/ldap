module.exports = {
    extends: [
      'eslint-config-qiwi',
      'prettier'
    ],
    overrides: [{
      files: ['./src/**/*.ts'],
      rules: {
        'unicorn/consistent-function-scoping': 'off',
        'unicorn/no-null': 'off',
        'unicorn/escape-case': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        'camelcase': 'off',
        'no-template-curly-in-string': 'off',
        'no-use-before-define': 'off',
        'prefer-promise-reject-errors': 'off',
        'n/no-callback-literal': 'off',
        'sonarjs/no-nested-template-literals': 'off',
        'sonarjs/no-duplicate-string': 'off',
        'sonarjs/cognitive-complexity': 'off',
      },
    }]
  };
  
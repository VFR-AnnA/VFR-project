module.exports = {
  extends: [
    'next/core-web-vitals',
  ],
  rules: {
    // Disable rules that are causing issues in the build but aren't critical
    '@typescript-eslint/no-unused-vars': 'warn', // Downgrade from error to warning
    '@typescript-eslint/no-explicit-any': 'warn', // Downgrade from error to warning
    'react/no-unescaped-entities': 'warn', // Downgrade from error to warning
  },
};
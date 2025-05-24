module.exports = {
  // Run ESLint on all JavaScript and TypeScript files
  "**/*.{js,jsx,ts,tsx}": ["eslint --fix"],
  
  // Run Prettier on all supported files
  "**/*.{js,jsx,ts,tsx,json,md,css}": ["prettier --write"]
};
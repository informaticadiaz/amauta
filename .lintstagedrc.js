module.exports = {
  // Archivos TypeScript y JavaScript
  '**/*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],

  // Archivos JSON
  '**/*.json': ['prettier --write'],

  // Archivos Markdown
  '**/*.md': ['prettier --write'],

  // Archivos YAML
  '**/*.{yml,yaml}': ['prettier --write'],
};

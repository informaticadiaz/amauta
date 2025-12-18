module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // Nueva funcionalidad
        'fix', // Corrección de errores
        'docs', // Cambios en documentación
        'style', // Cambios de formato (no afectan el código)
        'refactor', // Refactorización de código
        'perf', // Mejoras de rendimiento
        'test', // Agregar o corregir tests
        'chore', // Tareas de mantenimiento
        'ci', // Cambios en CI/CD
        'build', // Cambios en sistema de build
        'revert', // Revertir commits anteriores
      ],
    ],
    'subject-case': [0], // Permitir cualquier formato de capitalización
  },
};

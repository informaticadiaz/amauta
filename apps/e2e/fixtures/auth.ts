export const TEST_USERS = {
  superadmin: {
    email: process.env.E2E_USER_SUPERADMIN ?? 'superadmin@amauta.test',
    password: process.env.E2E_PASSWORD ?? 'password123',
  },
  admin: {
    email: process.env.E2E_USER_ADMIN ?? 'admin1@amauta.test',
    password: process.env.E2E_PASSWORD ?? 'password123',
  },
  educador: {
    email: process.env.E2E_USER_EDUCADOR ?? 'educador1@amauta.test',
    password: process.env.E2E_PASSWORD ?? 'password123',
  },
  estudiante: {
    email: process.env.E2E_USER_ESTUDIANTE ?? 'estudiante1@amauta.test',
    password: process.env.E2E_PASSWORD ?? 'password123',
  },
} as const;

export type TestUserRole = keyof typeof TEST_USERS;

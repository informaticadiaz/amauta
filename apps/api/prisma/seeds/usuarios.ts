/**
 * Seed de Usuarios y Perfiles
 * Etapa 1 del seed data
 */

import type { PrismaClient } from '@prisma/client';
import { Rol } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'password123';

interface UsuarioSeed {
  email: string;
  nombre: string;
  apellido: string;
  rol: Rol;
  perfil: {
    bio?: string;
    telefono?: string;
    pais: string;
    ciudad: string;
    institucion?: string;
    matricula?: string;
    grado?: string;
    especialidad?: string[];
    experiencia?: number;
  };
}

const usuariosData: UsuarioSeed[] = [
  // SUPER_ADMIN
  {
    email: 'superadmin@amauta.test',
    nombre: 'Admin',
    apellido: 'Sistema',
    rol: Rol.SUPER_ADMIN,
    perfil: {
      bio: 'Administrador del sistema Amauta',
      pais: 'Argentina',
      ciudad: 'Buenos Aires',
    },
  },
  // ADMIN_ESCUELA
  {
    email: 'admin1@amauta.test',
    nombre: 'María',
    apellido: 'García',
    rol: Rol.ADMIN_ESCUELA,
    perfil: {
      bio: 'Directora de la Escuela Primaria Belgrano',
      telefono: '+54 11 4555-1001',
      pais: 'Argentina',
      ciudad: 'Buenos Aires',
      institucion: 'Escuela Primaria Belgrano',
    },
  },
  {
    email: 'admin2@amauta.test',
    nombre: 'Carlos',
    apellido: 'López',
    rol: Rol.ADMIN_ESCUELA,
    perfil: {
      bio: 'Director del Colegio Secundario San Martín',
      telefono: '+54 11 4555-1002',
      pais: 'Argentina',
      ciudad: 'Córdoba',
      institucion: 'Colegio Secundario San Martín',
    },
  },
  // EDUCADORES
  {
    email: 'educador1@amauta.test',
    nombre: 'Ana',
    apellido: 'Martínez',
    rol: Rol.EDUCADOR,
    perfil: {
      bio: 'Profesora de Matemáticas con 10 años de experiencia',
      telefono: '+54 11 4555-2001',
      pais: 'Argentina',
      ciudad: 'Buenos Aires',
      institucion: 'Escuela Primaria Belgrano',
      especialidad: ['Matemáticas', 'Álgebra', 'Geometría'],
      experiencia: 10,
    },
  },
  {
    email: 'educador2@amauta.test',
    nombre: 'Pedro',
    apellido: 'Sánchez',
    rol: Rol.EDUCADOR,
    perfil: {
      bio: 'Profesor de Lengua y Literatura',
      telefono: '+54 11 4555-2002',
      pais: 'Argentina',
      ciudad: 'Buenos Aires',
      institucion: 'Escuela Primaria Belgrano',
      especialidad: ['Lengua', 'Literatura', 'Redacción'],
      experiencia: 8,
    },
  },
  {
    email: 'educador3@amauta.test',
    nombre: 'Laura',
    apellido: 'Fernández',
    rol: Rol.EDUCADOR,
    perfil: {
      bio: 'Profesora de Ciencias Naturales',
      telefono: '+54 11 4555-2003',
      pais: 'Argentina',
      ciudad: 'Córdoba',
      institucion: 'Colegio Secundario San Martín',
      especialidad: ['Biología', 'Física', 'Química'],
      experiencia: 12,
    },
  },
  // ESTUDIANTES
  {
    email: 'estudiante1@amauta.test',
    nombre: 'Juan',
    apellido: 'Pérez',
    rol: Rol.ESTUDIANTE,
    perfil: {
      pais: 'Argentina',
      ciudad: 'Buenos Aires',
      institucion: 'Escuela Primaria Belgrano',
      matricula: 'EST-2024-001',
      grado: '4°A',
    },
  },
  {
    email: 'estudiante2@amauta.test',
    nombre: 'Sofía',
    apellido: 'Rodríguez',
    rol: Rol.ESTUDIANTE,
    perfil: {
      pais: 'Argentina',
      ciudad: 'Buenos Aires',
      institucion: 'Escuela Primaria Belgrano',
      matricula: 'EST-2024-002',
      grado: '4°A',
    },
  },
  {
    email: 'estudiante3@amauta.test',
    nombre: 'Mateo',
    apellido: 'González',
    rol: Rol.ESTUDIANTE,
    perfil: {
      pais: 'Argentina',
      ciudad: 'Córdoba',
      institucion: 'Colegio Secundario San Martín',
      matricula: 'EST-2024-003',
      grado: '1°A',
    },
  },
  {
    email: 'estudiante4@amauta.test',
    nombre: 'Valentina',
    apellido: 'Díaz',
    rol: Rol.ESTUDIANTE,
    perfil: {
      pais: 'Argentina',
      ciudad: 'Córdoba',
      institucion: 'Colegio Secundario San Martín',
      matricula: 'EST-2024-004',
      grado: '1°A',
    },
  },
];

export async function seedUsuarios(prisma: PrismaClient): Promise<void> {
  console.log('👤 Creando usuarios y perfiles...');

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  for (const usuario of usuariosData) {
    const created = await prisma.usuario.upsert({
      where: { email: usuario.email },
      update: {
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
        activo: true,
        emailVerificado: new Date(),
      },
      create: {
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
        password: hashedPassword,
        activo: true,
        emailVerificado: new Date(),
        perfil: {
          create: {
            bio: usuario.perfil.bio,
            telefono: usuario.perfil.telefono,
            pais: usuario.perfil.pais,
            ciudad: usuario.perfil.ciudad,
            institucion: usuario.perfil.institucion,
            matricula: usuario.perfil.matricula,
            grado: usuario.perfil.grado,
            especialidad: usuario.perfil.especialidad || [],
            experiencia: usuario.perfil.experiencia,
          },
        },
      },
    });

    console.log(
      `   ✓ ${created.rol}: ${created.nombre} ${created.apellido} (${created.email})`
    );
  }

  console.log(`✅ ${usuariosData.length} usuarios creados\n`);
}

/**
 * Obtener usuarios por rol (helper para otras etapas)
 */
export async function getUsuariosByRol(prisma: PrismaClient, rol: Rol) {
  return prisma.usuario.findMany({
    where: { rol },
    orderBy: { email: 'asc' },
  });
}

/**
 * Obtener usuario por email (helper para otras etapas)
 */
export async function getUsuarioByEmail(prisma: PrismaClient, email: string) {
  return prisma.usuario.findUnique({
    where: { email },
  });
}

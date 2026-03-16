/**
 * Tests para DownloadCursoButton
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DownloadCursoButton } from './DownloadCursoButton';
import { db } from '@/lib/db/offline-db';

jest.mock('@/lib/db/offline-db', () => {
  const deleteMock = jest.fn().mockResolvedValue(undefined);
  const equalsMock = jest.fn(() => ({ delete: deleteMock }));
  const whereMock = jest.fn(() => ({ equals: equalsMock }));

  return {
    db: {
      cursos: {
        get: jest.fn(),
        put: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
      },
      lecciones: {
        bulkPut: jest.fn().mockResolvedValue(undefined),
        where: whereMock,
      },
    },
    __mocks__: { deleteMock, equalsMock, whereMock },
  };
});

const mockDb = db as unknown as {
  cursos: {
    get: jest.Mock;
    put: jest.Mock;
    delete: jest.Mock;
  };
  lecciones: {
    bulkPut: jest.Mock;
    where: jest.Mock;
  };
};

const cursoBase = {
  id: 'curso-1',
  slug: 'intro-algebra',
  titulo: 'Introducción al Álgebra',
  descripcion: 'Curso base de álgebra',
  imagen: null,
  nivel: 'PRINCIPIANTE' as const,
  duracion: 120,
  categoriaId: 'cat-1',
};

function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value,
  });
}

describe('DownloadCursoButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setOnline(true);
    global.fetch = jest.fn();
  });

  it('debería mostrar el botón de descarga cuando no hay curso offline', async () => {
    mockDb.cursos.get.mockResolvedValue(null);

    render(<DownloadCursoButton curso={cursoBase} totalLecciones={3} />);

    expect(
      await screen.findByRole('button', { name: /descargar para offline/i })
    ).toBeInTheDocument();
  });

  it('debería descargar y guardar el curso en IndexedDB', async () => {
    mockDb.cursos.get.mockResolvedValue(null);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        lecciones: [
          {
            id: 'leccion-1',
            cursoId: 'curso-1',
            titulo: 'Variables',
            contenido: { html: '<p>Contenido</p>' },
            tipo: 'TEXTO',
            orden: 1,
            publicada: true,
            updatedAt: '2026-03-15T00:00:00.000Z',
          },
          {
            id: 'leccion-2',
            cursoId: 'curso-1',
            titulo: 'Constantes',
            contenido: { markdown: 'Texto' },
            tipo: 'TEXTO',
            orden: 2,
            publicada: true,
            updatedAt: '2026-03-15T00:00:00.000Z',
          },
        ],
        total: 2,
      }),
    });

    render(<DownloadCursoButton curso={cursoBase} totalLecciones={3} />);

    const button = await screen.findByRole('button', {
      name: /descargar para offline/i,
    });
    await userEvent.click(button);

    await waitFor(() => {
      expect(mockDb.cursos.put).toHaveBeenCalledTimes(1);
      expect(mockDb.lecciones.bulkPut).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByRole('button', { name: /eliminar descarga/i })
    ).toBeInTheDocument();
  });

  it('debería eliminar la descarga y limpiar IndexedDB', async () => {
    mockDb.cursos.get.mockResolvedValue({ id: 'curso-1' });

    render(<DownloadCursoButton curso={cursoBase} totalLecciones={3} />);

    const eliminar = await screen.findByRole('button', {
      name: /eliminar descarga/i,
    });
    await userEvent.click(eliminar);

    await waitFor(() => {
      expect(mockDb.lecciones.where).toHaveBeenCalledWith('cursoId');
      expect(mockDb.cursos.delete).toHaveBeenCalledWith('curso-1');
    });

    expect(
      await screen.findByRole('button', { name: /descargar para offline/i })
    ).toBeInTheDocument();
  });
});

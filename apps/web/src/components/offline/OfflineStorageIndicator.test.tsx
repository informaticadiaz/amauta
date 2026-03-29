import React from 'react';
import { render, screen } from '@testing-library/react';
import { OfflineStorageIndicator } from './OfflineStorageIndicator';
import { db } from '@/lib/db/offline-db';

jest.mock('@/lib/db/offline-db', () => ({
  db: {
    cursos: {
      toArray: jest.fn(),
    },
  },
}));

const mockDb = db as unknown as {
  cursos: {
    toArray: jest.Mock;
  };
};

describe('OfflineStorageIndicator', () => {
  it('deberia mostrar el espacio usado estimado', async () => {
    mockDb.cursos.toArray.mockResolvedValue([
      { id: '1', tamanoBytes: 1024 * 1024 },
      { id: '2', tamanoBytes: 512 * 1024 },
    ]);

    render(<OfflineStorageIndicator />);

    expect(await screen.findByText(/1\.5 MB/i)).toBeInTheDocument();
    expect(await screen.findByText(/2 cursos/i)).toBeInTheDocument();
  });
});

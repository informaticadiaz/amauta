import React from 'react';
import { render, screen } from '@testing-library/react';
import { SyncStatusBadge } from './SyncStatusBadge';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSyncStatus } from '@/hooks/useSyncStatus';

jest.mock('@/hooks/useNetworkStatus');
jest.mock('@/hooks/useSyncStatus');

const mockUseNetworkStatus = useNetworkStatus as jest.Mock;
const mockUseSyncStatus = useSyncStatus as jest.Mock;

describe('SyncStatusBadge', () => {
  it('deberia indicar sincronizado cuando no hay pendientes', () => {
    mockUseNetworkStatus.mockReturnValue({ isOnline: true });
    mockUseSyncStatus.mockReturnValue({ pendingCount: 0, loading: false });

    render(<SyncStatusBadge />);

    expect(screen.getByText(/sincronizado/i)).toBeInTheDocument();
  });

  it('deberia indicar pendientes cuando existen', () => {
    mockUseNetworkStatus.mockReturnValue({ isOnline: true });
    mockUseSyncStatus.mockReturnValue({ pendingCount: 3, loading: false });

    render(<SyncStatusBadge />);

    expect(
      screen.getByText(/sincronizacion pendiente \(3\)/i)
    ).toBeInTheDocument();
  });

  it('deberia indicar sin conexion cuando esta offline', () => {
    mockUseNetworkStatus.mockReturnValue({ isOnline: false });
    mockUseSyncStatus.mockReturnValue({ pendingCount: 1, loading: false });

    render(<SyncStatusBadge />);

    expect(screen.getByText(/sin conexion/i)).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { OfflineBanner } from './OfflineBanner';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

jest.mock('@/hooks/useNetworkStatus');

const mockUseNetworkStatus = useNetworkStatus as jest.Mock;

describe('OfflineBanner', () => {
  it('deberia ocultarse cuando hay conexion', () => {
    mockUseNetworkStatus.mockReturnValue({ isOnline: true });

    render(<OfflineBanner />);

    expect(screen.queryByText(/sin conexion/i)).not.toBeInTheDocument();
  });

  it('deberia mostrarse cuando esta offline', () => {
    mockUseNetworkStatus.mockReturnValue({ isOnline: false });

    render(<OfflineBanner />);

    expect(screen.getByText(/sin conexion/i)).toBeInTheDocument();
  });
});

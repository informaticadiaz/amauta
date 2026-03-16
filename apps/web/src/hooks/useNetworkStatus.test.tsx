import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { useNetworkStatus } from './useNetworkStatus';

function TestComponent() {
  const { isOnline } = useNetworkStatus();
  return <div>{isOnline ? 'online' : 'offline'}</div>;
}

function setNavigatorOnline(value: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value,
  });
}

describe('useNetworkStatus', () => {
  it('deberia reflejar cambios de online a offline', () => {
    setNavigatorOnline(true);
    render(<TestComponent />);

    expect(screen.getByText('online')).toBeInTheDocument();

    act(() => {
      setNavigatorOnline(false);
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByText('offline')).toBeInTheDocument();

    act(() => {
      setNavigatorOnline(true);
      window.dispatchEvent(new Event('online'));
    });

    expect(screen.getByText('online')).toBeInTheDocument();
  });
});

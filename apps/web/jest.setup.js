/**
 * Setup de Jest
 * Se ejecuta antes de cada test suite
 */

/* eslint-env jest */

import '@testing-library/jest-dom';

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
      route: '/',
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock de next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }) => {
    // eslint-disable-next-line @next/next/no-img-element
    const React = require('react');
    return React.createElement('img', { src, alt, ...props });
  },
}));

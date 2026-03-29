/**
 * Tests para LeccionContent
 * Verifica el renderizado de contenido según el tipo de lección
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { LeccionContent } from './LeccionContent';

describe('LeccionContent', () => {
  function setOnline(value: boolean) {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value,
    });
  }

  beforeEach(() => {
    setOnline(true);
  });

  describe('tipo TEXTO', () => {
    it('debería renderizar contenido HTML de texto', () => {
      const contenido = { html: '<p>Hola mundo</p>', markdown: '# Hola' };
      render(
        <LeccionContent
          tipo="TEXTO"
          contenido={contenido}
          titulo="Lección de texto"
        />
      );
      expect(screen.getByText('Hola mundo')).toBeInTheDocument();
    });

    it('debería mostrar el título de la lección', () => {
      const contenido = { html: '<p>Contenido</p>' };
      render(
        <LeccionContent
          tipo="TEXTO"
          contenido={contenido}
          titulo="Mi Lección"
        />
      );
      expect(screen.getByText('Mi Lección')).toBeInTheDocument();
    });

    it('debería manejar contenido html vacío mostrando un mensaje', () => {
      render(
        <LeccionContent tipo="TEXTO" contenido={{}} titulo="Lección vacía" />
      );
      expect(screen.getByText(/sin contenido/i)).toBeInTheDocument();
    });
  });

  describe('tipo VIDEO', () => {
    it('debería renderizar iframe para videos de YouTube', () => {
      const contenido = {
        videoUrl: 'https://www.youtube.com/watch?v=abc123',
        provider: 'youtube',
      };
      render(
        <LeccionContent
          tipo="VIDEO"
          contenido={contenido}
          titulo="Video de YouTube"
        />
      );
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe?.src).toContain('youtube');
    });

    it('debería inferir YouTube cuando provider no viene informado', () => {
      const contenido = {
        videoUrl: 'https://youtu.be/IBm4QyDO50o?si=xjeeIsR9j4WW4k_X',
      };
      render(
        <LeccionContent
          tipo="VIDEO"
          contenido={contenido}
          titulo="Video sin provider"
        />
      );
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe?.src).toContain('youtube.com/embed/IBm4QyDO50o');
    });

    it('debería renderizar iframe para videos de Vimeo', () => {
      const contenido = {
        videoUrl: 'https://vimeo.com/123456',
        provider: 'vimeo',
      };
      render(
        <LeccionContent
          tipo="VIDEO"
          contenido={contenido}
          titulo="Video de Vimeo"
        />
      );
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe?.src).toContain('vimeo');
    });

    it('debería renderizar elemento video para videos locales', () => {
      const contenido = {
        videoUrl: '/uploads/video.mp4',
        provider: 'local',
      };
      render(
        <LeccionContent
          tipo="VIDEO"
          contenido={contenido}
          titulo="Video local"
        />
      );
      const video = document.querySelector('video');
      expect(video).toBeInTheDocument();
    });

    it('debería mostrar mensaje cuando no hay videoUrl', () => {
      render(
        <LeccionContent tipo="VIDEO" contenido={{}} titulo="Video sin URL" />
      );
      expect(screen.getByText(/video no disponible/i)).toBeInTheDocument();
    });

    it('debería mostrar mensaje offline para videos externos', () => {
      setOnline(false);

      render(
        <LeccionContent
          tipo="VIDEO"
          contenido={{
            videoUrl: 'https://www.youtube.com/watch?v=IBm4QyDO50o',
            provider: 'youtube',
          }}
          titulo="Video externo"
        />
      );

      expect(
        screen.getByText(/no está disponible sin conexión/i)
      ).toBeInTheDocument();
      expect(document.querySelector('iframe')).not.toBeInTheDocument();
    });
  });

  describe('tipos no soportados', () => {
    it('debería mostrar mensaje para tipo QUIZ', () => {
      render(<LeccionContent tipo="QUIZ" contenido={{}} titulo="Quiz" />);
      expect(screen.getByText(/próximamente/i)).toBeInTheDocument();
    });
  });
});

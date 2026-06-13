import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MediaUploader } from './MediaUploader';

describe('MediaUploader', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería mostrar el área de drag & drop cuando no hay archivo', () => {
    render(<MediaUploader value={null} onChange={jest.fn()} />);

    expect(screen.getByText(/arrastra un archivo/i)).toBeInTheDocument();
  });

  it('debería mostrar un preview de video cuando value tiene mimeType video', () => {
    render(
      <MediaUploader
        value={{
          url: 'https://media.amauta.test/amauta-media/lecciones/abc.mp4',
          storageKey: 'lecciones/abc.mp4',
          mimeType: 'video/mp4',
          size: 1024,
        }}
        onChange={jest.fn()}
      />
    );

    expect(document.querySelector('video')).toBeInTheDocument();
  });

  it('debería mostrar un preview de audio cuando value tiene mimeType audio', () => {
    render(
      <MediaUploader
        value={{
          url: 'https://media.amauta.test/amauta-media/lecciones/audio.mp3',
          storageKey: 'lecciones/audio.mp3',
          mimeType: 'audio/mpeg',
          size: 1024,
        }}
        onChange={jest.fn()}
      />
    );

    expect(document.querySelector('audio')).toBeInTheDocument();
  });

  it('debería rechazar un tipo de archivo no permitido', () => {
    render(<MediaUploader value={null} onChange={jest.fn()} />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(['contenido'], 'documento.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(input, { target: { files: [file] } });

    expect(
      screen.getByText(/tipo de archivo no permitido/i)
    ).toBeInTheDocument();
  });

  it('debería subir un archivo válido y notificar el resultado via onChange', async () => {
    const onChange = jest.fn();

    class MockXHR {
      static instances: MockXHR[] = [];
      upload = { onprogress: null as ((e: ProgressEvent) => void) | null };
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      status = 201;
      responseText = JSON.stringify({
        url: 'https://media.amauta.test/amauta-media/lecciones/abc.mp4',
        storageKey: 'lecciones/abc.mp4',
        mimeType: 'video/mp4',
        size: 2048,
      });
      open = jest.fn();
      send = jest.fn(() => {
        this.onload?.();
      });
      setRequestHeader = jest.fn();

      constructor() {
        MockXHR.instances.push(this);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).XMLHttpRequest = MockXHR;

    render(<MediaUploader value={null} onChange={onChange} />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(['contenido'], 'video.mp4', {
      type: 'video/mp4',
    });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        url: 'https://media.amauta.test/amauta-media/lecciones/abc.mp4',
        storageKey: 'lecciones/abc.mp4',
        mimeType: 'video/mp4',
        size: 2048,
      });
    });
  });

  it('debería permitir eliminar el archivo subido', () => {
    const onChange = jest.fn();

    render(
      <MediaUploader
        value={{
          url: 'https://media.amauta.test/amauta-media/lecciones/abc.mp4',
          storageKey: 'lecciones/abc.mp4',
          mimeType: 'video/mp4',
          size: 1024,
        }}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }));

    expect(onChange).toHaveBeenCalledWith(null);
  });
});

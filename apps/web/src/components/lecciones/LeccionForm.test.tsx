import { render, screen, fireEvent } from '@testing-library/react';
import { LeccionForm } from './LeccionForm';

jest.mock('./MediaUploader', () => ({
  MediaUploader: ({
    onChange,
  }: {
    onChange: (
      media: {
        url: string;
        storageKey: string;
        mimeType: string;
        size: number;
      } | null
    ) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onChange({
          url: 'https://media.amauta.test/amauta-media/lecciones/video.mp4',
          storageKey: 'lecciones/video.mp4',
          mimeType: 'video/mp4',
          size: 12345,
        })
      }
    >
      mock-media-uploader
    </button>
  ),
}));

describe('LeccionForm', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  it('debería mostrar la opción de subir archivo para tipo VIDEO', () => {
    render(<LeccionForm cursoId="curso-1" />);

    fireEvent.click(screen.getByRole('button', { name: 'Video' }));

    expect(
      screen.getByRole('button', { name: /subir archivo/i })
    ).toBeInTheDocument();
  });

  it('debería renderizar MediaUploader al seleccionar la opción de subir archivo', () => {
    render(<LeccionForm cursoId="curso-1" />);

    fireEvent.click(screen.getByRole('button', { name: 'Video' }));
    fireEvent.click(screen.getByRole('button', { name: /subir archivo/i }));

    expect(screen.getByText('mock-media-uploader')).toBeInTheDocument();
  });

  it('debería incluir storageKey, mimeType y size en el contenido al subir un archivo', async () => {
    render(<LeccionForm cursoId="curso-1" />);

    fireEvent.click(screen.getByRole('button', { name: 'Video' }));
    fireEvent.click(screen.getByRole('button', { name: /subir archivo/i }));
    fireEvent.click(screen.getByText('mock-media-uploader'));

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Lección de video subido' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear lección/i }));

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/cursos/curso-1/lecciones',
      expect.objectContaining({
        body: expect.stringContaining('"storageKey":"lecciones/video.mp4"'),
      })
    );

    const callArgs = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.contenido).toEqual({
      videoUrl: 'https://media.amauta.test/amauta-media/lecciones/video.mp4',
      provider: 'local',
      storageKey: 'lecciones/video.mp4',
      mimeType: 'video/mp4',
      size: 12345,
    });
  });

  describe('tipo INTERACTIVO (H5P)', () => {
    it('debería mostrar el campo de URL H5P al seleccionar el tipo Interactivo', () => {
      render(<LeccionForm cursoId="curso-1" />);

      fireEvent.click(screen.getByRole('button', { name: /interactivo/i }));

      expect(screen.getByLabelText(/url de embed h5p/i)).toBeInTheDocument();
    });

    it('debería mostrar error si la URL H5P no pertenece a un dominio permitido', () => {
      render(<LeccionForm cursoId="curso-1" />);

      fireEvent.click(screen.getByRole('button', { name: /interactivo/i }));
      fireEvent.change(screen.getByLabelText(/url de embed h5p/i), {
        target: { value: 'https://malicious-site.com/embed/123' },
      });

      expect(
        screen.getByText(/dominio.*no está permitido/i)
      ).toBeInTheDocument();
    });

    it('debería enviar h5pUrl y embedType en el contenido al crear una lección interactiva', async () => {
      render(<LeccionForm cursoId="curso-1" />);

      fireEvent.click(screen.getByRole('button', { name: /interactivo/i }));
      fireEvent.change(screen.getByLabelText('Título*'), {
        target: { value: 'Lección interactiva' },
      });
      fireEvent.change(screen.getByLabelText(/url de embed h5p/i), {
        target: { value: 'https://h5p.org/h5p/embed/123456' },
      });

      fireEvent.click(screen.getByRole('button', { name: /crear lección/i }));

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.contenido).toEqual({
        h5pUrl: 'https://h5p.org/h5p/embed/123456',
        embedType: 'iframe',
      });
    });
  });
});

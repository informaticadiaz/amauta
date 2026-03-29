import { render, screen } from '@testing-library/react';
import { ImageUploader } from './ImageUploader';

describe('ImageUploader', () => {
  it('debería mostrar preview para una imagen existente del curso', () => {
    render(
      <ImageUploader
        value="/uploads/cursos/portada.webp"
        onChange={jest.fn()}
      />
    );

    const preview = screen.getByAltText('Preview');

    expect(preview).toBeInTheDocument();
    expect(preview).toHaveAttribute(
      'src',
      '/api/image/uploads/cursos/portada.webp'
    );
  });
});

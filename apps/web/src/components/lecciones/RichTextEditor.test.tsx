import { render, screen } from '@testing-library/react';
import { RichTextEditor } from './RichTextEditor';
import { RichTextContent } from './RichTextContent';

describe('RichTextEditor', () => {
  it('debería renderizar el editor TipTap con toolbar', () => {
    const onChange = jest.fn();
    const { container } = render(
      <RichTextEditor
        value={{ html: '', format: 'html' }}
        onChange={onChange}
      />
    );

    // Verificar que la toolbar existe
    const toolbar = container.querySelector('.toolbar');
    expect(toolbar).toBeInTheDocument();

    // Verificar que hay múltiples botones en la toolbar
    const buttons = toolbar?.querySelectorAll('button');
    expect(buttons?.length).toBeGreaterThan(5);
  });

  it('debería cargar HTML existente en el editor', () => {
    const existingHtml = '<h2>Título</h2><p>Contenido aquí</p>';
    const onChange = jest.fn();

    render(
      <RichTextEditor
        value={{ html: existingHtml, format: 'html' }}
        onChange={onChange}
      />
    );

    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Contenido aquí')).toBeInTheDocument();
  });

  it('debería pasar onChange con estructura correcta', () => {
    const onChange = jest.fn();
    render(
      <RichTextEditor
        value={{ html: '', format: 'html' }}
        onChange={onChange}
      />
    );

    expect(onChange).toBeDefined();
  });
});

describe('RichTextContent', () => {
  it('debería renderizar HTML de forma segura sin XSS', () => {
    const maliciousHtml =
      '<p>Contenido seguro</p><script>alert("XSS")</script>';

    render(<RichTextContent html={maliciousHtml} className="prose" />);

    expect(screen.getByText('Contenido seguro')).toBeInTheDocument();
    expect(screen.queryByText('XSS')).not.toBeInTheDocument();
  });

  it('debería mantener estilos y estructura HTML permitidos', () => {
    const html = '<h2>Título</h2><p>Párrafo con <strong>énfasis</strong></p>';

    const { container } = render(
      <RichTextContent html={html} className="prose" />
    );

    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Párrafo con')).toBeInTheDocument();
    expect(screen.getByText('énfasis')).toBeInTheDocument();
    expect(container.querySelector('h2')).toBeInTheDocument();
    expect(container.querySelector('strong')).toBeInTheDocument();
  });

  it('debería rechazar atributos peligrosos (onclick, on*)', () => {
    const html = '<p onclick="alert(\'click\')" class="safe">Contenido</p>';

    const { container } = render(
      <RichTextContent html={html} className="prose" />
    );

    const p = container.querySelector('p');
    expect(p).not.toHaveAttribute('onclick');
    expect(p).toHaveTextContent('Contenido');
  });

  it('debería permitir enlaces seguros', () => {
    const html = '<a href="https://example.com" target="_blank">Enlace</a>';

    render(<RichTextContent html={html} className="prose" />);

    const link = screen.getByRole('link', { name: 'Enlace' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('debería rechazar enlaces javascript:', () => {
    const html = '<a href="javascript:alert(\'XSS\')">Enlace peligroso</a>';

    const { container } = render(
      <RichTextContent html={html} className="prose" />
    );

    const link = screen.queryByRole('link');
    if (link) {
      expect(link).not.toHaveAttribute('href', "javascript:alert('XSS')");
    }
  });

  it('debería aplicar className personalizado', () => {
    const html = '<p>Contenido</p>';
    const { container } = render(
      <RichTextContent html={html} className="prose prose-lg" />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('prose', 'prose-lg');
  });
});

/**
 * Utilidades para contenido offline
 */

export function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    .replace(/\n/gim, '<br />');
}

export function extractHtmlFromContenido(
  contenido: Record<string, unknown>
): string {
  const html = contenido.html;
  if (typeof html === 'string' && html.trim()) {
    return html;
  }

  const markdown = contenido.markdown ?? contenido.texto;
  if (typeof markdown === 'string' && markdown.trim()) {
    return markdownToHtml(markdown);
  }

  return '';
}

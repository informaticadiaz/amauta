'use client';

import DOMPurify from 'dompurify';

interface RichTextContentProps {
  html: string;
  className?: string;
}

export function RichTextContent({
  html,
  className = '',
}: RichTextContentProps) {
  const safeHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h2',
      'h3',
      'p',
      'strong',
      'em',
      'ul',
      'ol',
      'li',
      'code',
      'pre',
      'a',
      'blockquote',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });

  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: safeHtml }} />
  );
}

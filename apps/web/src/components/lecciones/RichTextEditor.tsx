'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';
import styles from './RichTextEditor.module.css';

interface ContenidoTexto {
  html: string;
  format: 'html';
}

interface RichTextEditorProps {
  value: ContenidoTexto;
  onChange: (value: ContenidoTexto) => void;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value.html || '',
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange({
        html: editor.getHTML(),
        format: 'html',
      });
    },
  });

  useEffect(() => {
    if (editor && value.html && editor.getHTML() !== value.html) {
      editor.commands.setContent(value.html);
    }
  }, [editor, value.html]);

  if (!editor) {
    return <div>Cargando editor...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          title="Negrita (Ctrl+B)"
          aria-label="negrita"
        >
          <strong>B</strong>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          title="Cursiva (Ctrl+I)"
          aria-label="cursiva"
        >
          <em>I</em>
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          title="Encabezado H2"
          aria-label="encabezado-h2"
        >
          H2
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          title="Encabezado H3"
          aria-label="encabezado-h3"
        >
          H3
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Lista con viñetas"
          aria-label="lista"
        >
          • Lista
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Lista numerada"
          aria-label="lista numerada"
        >
          1. Numerada
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Bloque de código"
          aria-label="código"
        >
          &lt;&gt; Código
        </button>

        <button
          onClick={() => {
            const url = window.prompt('Ingresa la URL:');
            if (url) {
              editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({ href: url })
                .run();
            }
          }}
          title="Insertar enlace"
          aria-label="enlace"
        >
          🔗 Enlace
        </button>
      </div>

      <div className={styles.editor}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

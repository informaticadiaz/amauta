/**
 * Componente LeccionContent
 *
 * Renderiza el contenido de una lección según su tipo (TEXTO, VIDEO, etc.)
 */

import { inferVideoProvider } from '@/lib/offline/video-cache';
import { RichTextContent } from './RichTextContent';

interface ContenidoTexto {
  html?: string;
  markdown?: string;
}

interface ContenidoVideo {
  videoUrl?: string;
  provider?: 'youtube' | 'vimeo' | 'local';
}

type Contenido = ContenidoTexto & ContenidoVideo & Record<string, unknown>;

type TipoLeccion = 'VIDEO' | 'TEXTO' | 'QUIZ' | 'INTERACTIVO' | 'DESCARGABLE';

interface Props {
  tipo: TipoLeccion;
  contenido: Contenido;
  titulo: string;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match?.[1] ?? null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match?.[1] ?? null;
}

function VideoPlayer({ contenido }: { contenido: ContenidoVideo }) {
  const { videoUrl, provider } = contenido;

  if (!videoUrl) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-[var(--overlay)] text-[var(--muted)]">
        <p>Video no disponible</p>
      </div>
    );
  }

  const resolvedProvider = inferVideoProvider(videoUrl, provider);
  const offlineEmbedBlocked =
    typeof navigator !== 'undefined' &&
    navigator.onLine === false &&
    resolvedProvider !== 'local';

  if (offlineEmbedBlocked) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-lg bg-[var(--overlay)] px-6 text-center text-[var(--muted)]">
        <p>
          Este video depende de una plataforma externa y no está disponible sin
          conexión.
        </p>
      </div>
    );
  }

  if (resolvedProvider === 'youtube') {
    const videoId = getYouTubeId(videoUrl);
    const embedUrl = videoId
      ? `https://www.youtube.com/embed/${videoId}`
      : videoUrl;

    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          src={embedUrl}
          title="Video de YouTube"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  if (resolvedProvider === 'vimeo') {
    const videoId = getVimeoId(videoUrl);
    const embedUrl = videoId
      ? `https://player.vimeo.com/video/${videoId}`
      : videoUrl;

    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          src={embedUrl}
          title="Video de Vimeo"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  // Video local
  return (
    <div className="w-full overflow-hidden rounded-lg bg-black">
      <video src={videoUrl} controls className="w-full" preload="metadata">
        Tu navegador no soporta la reproducción de video.
      </video>
    </div>
  );
}

function TextoContent({ contenido }: { contenido: ContenidoTexto }) {
  if (!contenido.html && !contenido.markdown) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg bg-[var(--overlay)] text-[var(--muted)]">
        <p>Sin contenido disponible</p>
      </div>
    );
  }

  if (contenido.html) {
    return (
      <RichTextContent
        html={contenido.html}
        className="prose prose-lg max-w-none text-[var(--foreground)] [&_a]:text-primary [&_h1]:text-[var(--foreground)] [&_h2]:text-[var(--foreground)] [&_h3]:text-[var(--foreground)]"
      />
    );
  }

  // Fallback: mostrar markdown como texto preformateado
  return (
    <pre className="whitespace-pre-wrap rounded-lg bg-[var(--overlay)] p-6 text-sm text-[var(--foreground)]">
      {contenido.markdown}
    </pre>
  );
}

export function LeccionContent({ tipo, contenido, titulo }: Props) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)] lg:text-3xl">
        {titulo}
      </h1>

      {tipo === 'VIDEO' && <VideoPlayer contenido={contenido} />}

      {tipo === 'TEXTO' && <TextoContent contenido={contenido} />}

      {tipo !== 'VIDEO' && tipo !== 'TEXTO' && (
        <div className="flex h-48 flex-col items-center justify-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--overlay)] text-center">
          <svg
            className="h-12 w-12 text-[var(--muted)]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="font-medium text-[var(--foreground)]">Próximamente</p>
            <p className="text-sm text-[var(--muted)]">
              Este tipo de contenido estará disponible en próximas versiones.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

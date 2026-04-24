import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { ForoListado } from '@/components/foros/ForoListado';

interface Curso {
  id: string;
  titulo: string;
  slug: string;
  educador: {
    id: string;
  };
}

interface CursoResponse {
  curso: Curso;
}

async function getCurso(slug: string): Promise<Curso | null> {
  try {
    const data = await api.get<CursoResponse>(`/cursos/slug/${slug}`);
    return data.curso;
  } catch {
    return null;
  }
}

export default async function CursoForoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/cursos/${slug}/foro`);
  }

  const curso = await getCurso(slug);
  if (!curso) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-sm font-medium text-primary">Foro del curso</p>
          <h1 className="mt-2 text-4xl font-semibold text-[var(--foreground)]">
            {curso.titulo}
          </h1>
          <p className="mt-3 max-w-3xl text-[var(--muted)]">
            Espacio para hacer preguntas, compartir ideas y seguir las
            conversaciones del curso.
          </p>
        </header>

        <ForoListado
          cursoId={curso.id}
          cursoSlug={curso.slug}
          currentUserId={session.user.id}
          currentUserRol={session.user.rol}
        />
      </div>
    </div>
  );
}

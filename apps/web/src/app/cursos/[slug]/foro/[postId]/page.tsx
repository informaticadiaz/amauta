import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { ForoDetalle } from '@/components/foros/ForoDetalle';

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

export default async function CursoForoDetallePage({
  params,
}: {
  params: Promise<{ slug: string; postId: string }>;
}) {
  const { slug, postId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/cursos/${slug}/foro/${postId}`);
  }

  const curso = await getCurso(slug);
  if (!curso) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <ForoDetalle
          cursoId={curso.id}
          postId={postId}
          currentUserId={session.user.id}
          currentUserRol={session.user.rol}
          courseEducadorId={curso.educador.id}
          courseSlug={curso.slug}
        />
      </div>
    </div>
  );
}

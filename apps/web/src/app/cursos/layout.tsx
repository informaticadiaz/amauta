import { MainLayout } from '@/components/layout';

export default function CursosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}

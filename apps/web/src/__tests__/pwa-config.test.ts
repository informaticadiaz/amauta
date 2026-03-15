import fs from 'fs';
import path from 'path';

describe('PWA next-pwa config', () => {
  const configPath = path.join(process.cwd(), 'next.config.js');
  const content = fs.readFileSync(configPath, 'utf8');

  it('integra @ducanh2912/next-pwa con dest public', () => {
    expect(content).toMatch(/@ducanh2912\/next-pwa/);
    expect(content).toMatch(/dest:\s*['"]public['"]/);
  });

  it('habilita reloadOnOnline y deshabilita SW en development', () => {
    expect(content).toMatch(/reloadOnOnline:\s*true/);
    expect(content).toMatch(
      /disable:\s*process\.env\.NODE_ENV\s*===\s*['"]development['"]/
    );
  });

  it('define runtimeCaching para assets estáticos con CacheFirst', () => {
    expect(content).toMatch(/runtimeCaching/);
    expect(content).toMatch(/CacheFirst/);
    expect(content).toContain('/_next\\/static');
  });

  it('usa NetworkFirst para API auth', () => {
    expect(content).toMatch(/NetworkFirst/);
    expect(content).toContain('/api\\/auth');
  });

  it('usa StaleWhileRevalidate para API pública', () => {
    expect(content).toMatch(/StaleWhileRevalidate/);
    expect(content).toContain('/api\\/(cursos|lecciones|image)');
  });

  it('cachea imágenes con expiración de 30 días', () => {
    expect(content).toMatch(/image-cache/);
    expect(content).toMatch(
      /maxAgeSeconds:\s*(?:60\s*\*\s*60\s*\*\s*24\s*\*\s*30|30\s*\*\s*24\s*\*\s*60\s*\*\s*60)/
    );
  });
});

import fs from 'fs';
import path from 'path';

describe('PWA manifest', () => {
  const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');

  it('existe el archivo manifest.json', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
  });

  it('incluye campos requeridos', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBeTruthy();
    expect(manifest.background_color).toBeTruthy();
    expect(manifest.lang).toBeTruthy();
    expect(manifest.orientation).toBeTruthy();
  });

  it('incluye iconos maskable any 192 y 512', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const icons = Array.isArray(manifest.icons) ? manifest.icons : [];

    const has192 = icons.some(
      (icon: { sizes?: string; purpose?: string }) =>
        icon.sizes === '192x192' && icon.purpose === 'maskable any'
    );
    const has512 = icons.some(
      (icon: { sizes?: string; purpose?: string }) =>
        icon.sizes === '512x512' && icon.purpose === 'maskable any'
    );

    expect(has192).toBe(true);
    expect(has512).toBe(true);
  });
});

describe('Metadata en layout', () => {
  const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');
  const content = fs.readFileSync(layoutPath, 'utf8');

  it('vincula el manifest', () => {
    expect(content).toMatch(/manifest:\s*['"]\/manifest\.json['"]/);
  });

  it('define themeColor en metadata', () => {
    expect(content).toMatch(/themeColor:\s*['"]/);
  });

  it('incluye appleWebApp y formatDetection', () => {
    expect(content).toMatch(/appleWebApp:\s*{/);
    expect(content).toMatch(/formatDetection:\s*{/);
  });
});

/*
  Generate raster favicon assets from public/favicon.svg
  - PNGs: 16, 32, 48, 180, 192, 512 (+ maskable 512)
  - ICO: multi-size 16/32/48
*/

const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const pngToIco = require('png-to-ico');

async function ensureFileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function renderPngFromSvg(svgPath, size, outPath) {
  const density = Math.max(96, size * 4); // higher density for crisp edges
  await sharp(svgPath, { density })
    .resize(size, size, { fit: 'contain' })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath);
}

async function generate() {
  const projectRoot = path.resolve(__dirname, '..');
  const publicDir = path.join(projectRoot, 'public');
  const svgPath = path.join(publicDir, 'favicon.svg');

  if (!(await ensureFileExists(svgPath))) {
    throw new Error(`Missing public/favicon.svg at: ${svgPath}`);
  }

  const targets = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 48, name: 'favicon-48x48.png' }, // helpful for Google 48px logical
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' },
    { size: 512, name: 'maskable-icon-512x512.png' },
  ];

  // Generate PNGs in parallel
  await Promise.all(
    targets.map(({ size, name }) =>
      renderPngFromSvg(svgPath, size, path.join(publicDir, name))
    )
  );

  // Build multi-size ICO from the 16/32/48 PNGs
  const icoPngs = [16, 32, 48].map((s) => path.join(publicDir, `favicon-${s}x${s}.png`));
  const icoBuffer = await pngToIco(icoPngs);
  await fs.writeFile(path.join(publicDir, 'favicon.ico'), icoBuffer);

  // Provide a monochrome Safari pinned tab SVG (mask icon)
  // We coerce fills to solid black and remove strokes, which Safari treats as a template mask.
  const safariMask = path.join(publicDir, 'safari-pinned-tab.svg');
  try {
    const rawSvg = await fs.readFile(svgPath, 'utf8');
    let masked = rawSvg
      // replace any explicit fill that isn't 'none' with black
      .replace(/fill="(?!none)[^"]*"/gi, 'fill="#000"')
      // remove strokes
      .replace(/stroke="[^"]*"/gi, 'stroke="none"')
      // handle inline style fills
      .replace(/fill:\s*#[0-9a-f]{3,8}/gi, 'fill:#000');

    // ensure root <svg ...> has a default black fill
    masked = masked.replace(/<svg(\s+[^>]*)?>/i, (m) => {
      return m.includes('fill=') ? m : m.replace('>', ' fill="#000">');
    });

    await fs.writeFile(safariMask, masked, 'utf8');
  } catch (e) {
    // fallback to copying if transformation fails
    await fs.copyFile(svgPath, safariMask);
  }

  console.log('✅ Icons generated in /public');
}

generate().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});



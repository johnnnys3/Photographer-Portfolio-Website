/**
 * Shrink a photo in the browser before it is uploaded: scale so the longest side is at most
 * `maxEdge` pixels and re-encode as WebP (JPEG/PNG where WebP is not available). A 6 MB camera
 * JPEG typically becomes 300-500 KB. SVGs pass through untouched, and the original is kept if it
 * is already smaller than the re-encoded version.
 */
export type Compressed = {
  blob: Blob;
  width: number; // 0 for SVG
  height: number;
  type: string;
  ext: string;
  before: number; // bytes
  after: number;
};

const EXT: Record<string, string> = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/avif': 'avif', 'image/svg+xml': 'svg' };

const toBlob = (c: HTMLCanvasElement, type: string, q: number) => new Promise<Blob | null>((res) => c.toBlob(res, type, q));

// 2000px is sharp on a full-width 1456px screen, and 0.8 WebP keeps a photo near 200-300 KB, so the free 1 GB holds ~3000+ photos.
export async function compressImage(file: Blob, maxEdge = 2000, quality = 0.8): Promise<Compressed> {
  const before = file.size;
  if (file.type === 'image/svg+xml') return { blob: file, width: 0, height: 0, type: file.type, ext: 'svg', before, after: before };

  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, maxEdge / Math.max(bmp.width, bmp.height));
  const width = Math.round(bmp.width * scale);
  const height = Math.round(bmp.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, width, height);
  bmp.close();

  let type = 'image/webp';
  let blob = await toBlob(canvas, type, quality);
  if (!blob || blob.type !== 'image/webp') {
    // Browser cannot encode WebP: keep transparency for PNGs, otherwise JPEG
    type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    blob = await toBlob(canvas, type, quality);
  }
  if (!blob) throw new Error('This browser could not process the picture.');

  // Already small and not resized: the original is the better file.
  if (scale === 1 && before <= blob.size && EXT[file.type]) {
    return { blob: file, width, height, type: file.type, ext: EXT[file.type], before, after: before };
  }
  return { blob, width, height, type: blob.type, ext: EXT[blob.type] ?? 'jpg', before, after: blob.size };
}

export const formatBytes = (n: number) =>
  n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

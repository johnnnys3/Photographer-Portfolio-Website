import { ImageResponse } from 'next/og';
import { getSite } from '@/content/data';

export const alt = 'Photographer portfolio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Text-only card (no remote images) so builds never depend on the network.
export default async function OgImage() {
  const site = await getSite();
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', background: '#FFFFFF', color: '#000000', padding: 72 }}>
        <div style={{ display: 'flex', fontSize: 28, letterSpacing: 2, color: '#6B6A6A', textTransform: 'uppercase' }}>
          {`Photographer · ${site.city}, ${site.country}`}
        </div>
        <div style={{ display: 'flex', fontSize: 170, lineHeight: 1, textTransform: 'uppercase' }}>{site.name}</div>
        <div style={{ display: 'flex', width: 96, height: 2, background: '#000000' }} />
      </div>
    ),
    size,
  );
}

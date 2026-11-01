/**
 * Desktop only: when a project cover is clicked, a copy of the cover grows from its place in the grid
 * to exactly where the first photograph of the gallery will sit, then fades away once the real page is
 * there. It lives on <body>, so it survives the page change. Phones and reduced motion skip it.
 */
export function growCover(e: React.MouseEvent<HTMLElement>, ratio: number) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  if (!matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)').matches) return;
  const box = e.currentTarget.querySelector('span');
  const img = e.currentTarget.querySelector('img');
  if (!box || !img) return;

  const from = box.getBoundingClientRect();
  const vw = innerWidth;
  const vh = innerHeight;
  // Mirrors the gallery layout: caption column at the left, photos centred in the row, landscapes at 55% height.
  const edge = Math.min(40, Math.max(20, vw * 0.025));
  const header = 84;
  const rowH = vh - header - 88;
  const h = ratio >= 1 ? (vh - 230) * 0.55 : vh - 230;
  const to = { left: edge + 280 + 56, top: header + (rowH - h) / 2, width: h * ratio, height: h };

  const clone = document.createElement('img');
  clone.src = img.currentSrc || img.src;
  clone.alt = '';
  Object.assign(clone.style, {
    position: 'fixed',
    zIndex: '70',
    pointerEvents: 'none',
    objectFit: 'cover',
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
  });
  document.body.appendChild(clone);

  const box2 = (r: { left: number; top: number; width: number; height: number }) => ({
    left: `${r.left}px`,
    top: `${r.top}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
  });
  clone
    .animate([box2(from), box2(to)], { duration: 700, easing: 'cubic-bezier(0.2, 0.6, 0.2, 1)', fill: 'forwards' })
    .finished.then(() => {
      // Hold until the gallery has had time to arrive, then crossfade into the real photograph.
      setTimeout(() => {
        clone.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).finished.then(() => clone.remove());
      }, 500);
    })
    .catch(() => clone.remove());
}

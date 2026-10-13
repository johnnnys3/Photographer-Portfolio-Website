/** Small glyph for a social link, as on the reference: Instagram and YouTube get an icon, anything else its name. */
export function SocialIcon({ label }: { label: string }) {
  const p = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, 'aria-hidden': true } as const;
  const l = label.toLowerCase();
  if (l.includes('instagram'))
    return (
      <svg {...p}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="0.8" fill="currentColor" />
      </svg>
    );
  if (l.includes('youtube'))
    return (
      <svg {...p}>
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
        <path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" />
      </svg>
    );
  return <span className="text-[15px] uppercase tracking-[0.04em]">{label}</span>;
}

// Editorial metadata for gallery project pages.
// Keyed by gallery id. Falls back to generic copy derived from the gallery
// name when a gallery has no explicit entry here (new galleries created in
// admin still get a working project page without a code change).

export interface ProjectMeta {
  category: string;
  year: string;
  description: string;
}

export const PROJECT_META: Record<string, ProjectMeta> = {
  landscapes: {
    category: 'Landscape',
    year: '2026',
    description:
      'A study in scale and light — wide, quiet frames built around weather, terrain and the moment a landscape stops being scenery and starts feeling like a place.',
  },
  portraits: {
    category: 'Portrait',
    year: '2026',
    description:
      'Close, unhurried frames. Less about a likeness, more about catching someone mid-thought — the expression that happens right before or after the one they meant to give you.',
  },
  weddings: {
    category: 'Editorial',
    year: '2026',
    description:
      'Documentary-first coverage of a day that moves fast. We stay close to the small, unscripted moments in between the ones everyone is already looking at.',
  },
  events: {
    category: 'Culture',
    year: '2026',
    description:
      'On the ground, moving with the room. Coverage built for atmosphere over posed setups — the texture of a night, not just proof it happened.',
  },
};

const FALLBACK_DESCRIPTION =
  'A working collection — images gathered around a shared subject, shot with an interest in light, texture and the moment before things settle.';

export function getProjectMeta(id: string, name: string): ProjectMeta {
  return (
    PROJECT_META[id.toLowerCase()] || {
      category: name,
      year: '2026',
      description: FALLBACK_DESCRIPTION,
    }
  );
}

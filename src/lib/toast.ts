/** Show the small paper-coloured toast (rendered by <Toaster />). Client-only. */
export const toast = (message: string) =>
  window.dispatchEvent(new CustomEvent<string>('darkroom:toast', { detail: message }));

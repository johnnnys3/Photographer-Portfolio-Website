/** `(Selected work)`: a quiet mono caption above a section. */
export function Label({ children }: { children: React.ReactNode }) {
  return <p className="t-label">({children})</p>;
}

// Unlike layout.tsx, a template remounts on every navigation, so this wrapper replays its CSS fade.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}

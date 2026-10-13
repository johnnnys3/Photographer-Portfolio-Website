import Link from 'next/link';

interface ProjectNavItem {
  id: string;
  name: string;
}

interface ProjectNavProps {
  previous: ProjectNavItem | null;
  next: ProjectNavItem | null;
}

export function ProjectNav({ previous, next }: ProjectNavProps) {
  if (!previous && !next) return null;

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 px-6 lg:px-12 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
        {previous ? (
          <Link href={`/galleries/${previous.id}`} data-cursor="Open" className="group">
            <span className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-600 mb-2">
              Previous
            </span>
            <span className="text-2xl lg:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white group-hover:-translate-x-2 inline-block transition-transform">
              {previous.name}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {next && (
          <Link href={`/galleries/${next.id}`} data-cursor="Open" className="group sm:text-right">
            <span className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-600 mb-2">
              Next
            </span>
            <span className="text-2xl lg:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white group-hover:translate-x-2 inline-block transition-transform">
              {next.name}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

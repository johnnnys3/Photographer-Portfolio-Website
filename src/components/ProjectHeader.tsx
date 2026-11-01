interface ProjectHeaderProps {
  number: string;
  title: string;
  category: string;
  year: string;
  description: string;
}

export function ProjectHeader({ number, title, category, year, description }: ProjectHeaderProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-16 border-b border-gray-200 dark:border-gray-800">
      <span className="block text-sm font-mono text-gray-400 dark:text-gray-600 mb-4">{number}</span>
      <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.9] text-gray-900 dark:text-white mb-8">
        {title}
      </h1>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-light leading-relaxed max-w-xl">
          {description}
        </p>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {category} / {year}
        </span>
      </div>
    </div>
  );
}

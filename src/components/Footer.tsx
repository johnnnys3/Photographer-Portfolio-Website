import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 px-6 lg:px-12 py-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="w-8 h-8 bg-black dark:bg-white mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            Still looking?
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-8 gap-y-2 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
          <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Studio</Link>
          <Link href="/galleries" className="hover:text-black dark:hover:text-white transition-colors">Work</Link>
          <Link href="/about" className="hover:text-black dark:hover:text-white transition-colors">About</Link>
          <Link href="/contact" className="hover:text-black dark:hover:text-white transition-colors">Contact</Link>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-black dark:hover:text-white transition-colors">Instagram</a>
        </nav>

        <p className="text-xs text-gray-400 dark:text-gray-600 font-mono">
          &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}

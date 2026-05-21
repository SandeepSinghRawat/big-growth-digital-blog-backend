import '../styles/globals.css';

export const metadata = {
  title: 'Big Growth Digital Blog CMS',
  description: 'Serverless blog CMS with SEO-first content, categories, tags, and search.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-950 antialiased">
        <div className="min-h-screen">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
              <a href="/" className="text-lg font-semibold tracking-tight text-slate-950">
                Big Growth Digital
              </a>
              <nav className="flex gap-4 text-sm text-slate-600">
                <a href="/search" className="transition hover:text-slate-950">Search</a>
                <a href="/admin/login" className="transition hover:text-slate-950">Admin</a>
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

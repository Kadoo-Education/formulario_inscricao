'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const PAGES = [
  {
    href: '/',
    label: 'Capa',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 10.4L10 4l7 6.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.2 9.2V16h3.5v-3.5h2.6V16H15V9.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: '/arvore',
    label: 'Árvore de Devedores',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="3.5" cy="10" r="1.9" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="16.5" cy="5.5" r="1.9" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="16.5" cy="14.5" r="1.9" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5.4 10h4.6M10 10V5.5h4.6M10 10v4.5h4.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-sidebar" aria-label="Navegação principal">
      <div className="sidebar-logo" aria-hidden="true" />
      <nav className="sidebar-nav">
        {PAGES.map(({ href, label, icon }) => {
          const isActive = href === '/'
            ? pathname === '/'
            : pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-item${isActive ? ' active' : ''}`}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              {icon}
              <span className="sidebar-tip">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

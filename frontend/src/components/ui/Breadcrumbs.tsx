import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`mb-4 ${className}`}>
      <ol className="flex items-center gap-1.5 text-[11px] text-gray-500 font-mono">
        <li>
          <Link to="/" className="hover:text-brand-lime transition-colors duration-150" aria-label="Home">
            <Home size={12} />
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight size={10} className="text-gray-700" />
            {item.href ? (
              <Link
                to={item.href}
                className="hover:text-brand-lime transition-colors duration-150 flex items-center gap-1"
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-300 flex items-center gap-1" aria-current="page">
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

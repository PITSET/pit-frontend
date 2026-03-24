import React from 'react';
import { Link } from 'react-router-dom';
import { HiChevronRight } from 'react-icons/hi2';
import useBreadcrumbs from '../../hooks/useBreadcrumbs';

/**
 * Breadcrumbs - A reusable navigation component to show page hierarchy.
 * @param {Array} [items] - Optional manual items to override automatic ones.
 */
export default function Breadcrumbs({ items: manualItems }) {
  const generatedItems = useBreadcrumbs();
  const items = manualItems || generatedItems;

  // Don't show breadcrumbs if it's just home or empty
  if (items.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-sm font-medium py-4 animate-in fade-in slide-in-from-left-4 duration-500" aria-label="Breadcrumb">
      <Link
        to="/"
        className="text-gray-500 hover:text-red-600 transition-colors"
      >
        Home
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <HiChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          {index === items.length - 1 ? (
            <span className="text-red-600 font-bold truncate max-w-[200px] md:max-w-none">
              {item.label}
            </span>
          ) : (
            <Link
              to={item.path}
              className="text-gray-500 hover:text-red-600 transition-colors truncate max-w-[150px] md:max-w-none"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

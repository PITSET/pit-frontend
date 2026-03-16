import React from 'react';
import { Link } from 'react-router-dom';
import { HiChevronRight } from 'react-icons/hi2';

/**
 * Breadcrumbs - A reusable navigation component to show page hierarchy.
 * @param {Array} items - Array of { label: string, path: string }
 */
export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="flex items-center gap-2 text-sm font-medium mb-6 animate-in fade-in slide-in-from-left-4 duration-500" aria-label="Breadcrumb">
      {/* Home is always the first item */}
      {items.length === 0 ? (
        <span className="text-red-600 font-bold">
          Home
        </span>
      ) : (
        <Link
          to="/"
          className="text-gray-500 hover:text-red-600 transition-colors"
        >
          Home
        </Link>
      )}

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

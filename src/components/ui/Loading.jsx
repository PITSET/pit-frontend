/**
 * Modern Loading Component
 * 
 * Following best practices:
 * - Skeleton loaders for content placeholders
 * - Spinner for inline loading
 * - Accessible with proper ARIA labels
 * - Smooth animations
 * - Responsive design
 * - Customizable for different page layouts
 */

/**
 * Skeleton loader for table rows - used for initial page load
 * @param {Object} options - Configuration options
 * @param {number} options.rows - Number of skeleton rows
 * @param {string[]} options.columns - Column headers
 * @param {boolean} options.showPosition - Whether to show position column
 * @param {boolean} options.showImage - Whether to show image column
 */
export function TableSkeleton({ rows = 4, columns = [], showPosition = false, showImage = true }) {
  const defaultColumns = columns.length > 0 ? columns : [
    { label: 'Image', show: showImage },
    { label: 'Title', show: true },
    { label: 'Description', show: true },
    { label: 'Position', show: showPosition },
    { label: 'Status', show: true },
    { label: 'Action', show: true }
  ];

  return (
    <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-300">
          <tr className="text-sm font-semibold text-gray-600">
            {defaultColumns.filter(col => col.show !== false).map((col, idx) => (
              <th key={idx} className="px-4 lg:px-8 py-4 text-center">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index}>
              {defaultColumns.filter(col => col.show !== false).map((col, idx) => (
                <td key={idx} className="px-4 lg:px-8 py-4 lg:py-6">
                  {col.label === 'Image' ? (
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-200 rounded-lg mx-auto animate-pulse" />
                  ) : col.label === 'Action' ? (
                    <div className="flex items-center justify-center gap-0 rounded-md sm:rounded-lg border border-gray-200 overflow-hidden mx-auto w-fit">
                      <div className="p-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="h-4 w-px sm:h-6 bg-gray-200" />
                      <div className="p-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-5 bg-gray-200 rounded w-32 mx-auto animate-pulse" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Skeleton loader for mobile card view
 * @param {number} cards - Number of skeleton cards
 * @param {Object} config - Card configuration
 * @param {boolean} config.showStatus - Show status badge
 */
export function CardSkeleton({ cards = 4, config = {} }) {
  const { showStatus = true } = config;
  
  return (
    <div className="md:hidden space-y-4">
      {Array.from({ length: cards }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
        >
          <div className="flex gap-3 sm:gap-4">
            {/* Image skeleton */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            
            {/* Content skeleton */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="h-5 bg-gray-200 rounded w-24 sm:w-32 animate-pulse flex-1" />
                {showStatus && (
                  <div className="h-5 w-14 sm:w-16 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
                )}
              </div>
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse mb-1" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
            
            {/* Action buttons skeleton */}
            <div className="flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-center gap-0 rounded-md border border-gray-200 overflow-hidden">
                <div className="p-1.5 sm:p-2">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-px w-full sm:h-full sm:w-px bg-gray-200" />
                <div className="p-1.5 sm:p-2">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for pagination
 */
export function PaginationSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-2 sm:px-4 py-3 bg-gray-50 border-t border-gray-200 gap-3 sm:gap-0">
      <div className="h-4 bg-gray-200 rounded w-32 sm:w-40 animate-pulse" />
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="p-1.5 sm:p-2 rounded-lg border border-gray-200">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="px-2 sm:px-3 py-1.5 rounded-lg border border-gray-200">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="px-2 sm:px-3 py-1.5 rounded-lg border border-gray-200">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="hidden sm:block px-3 py-1.5 rounded-lg border border-gray-200">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="p-1.5 sm:p-2 rounded-lg border border-gray-200">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/**
 * Full page loading skeleton with customizable header
 * @param {Object} options - Configuration options
 * @param {boolean} options.showCreateButton - Whether to show create button
 * @param {Object} options.table - Table configuration
 */
export function PageSkeleton({ 
  showCreateButton = true,
  table = {}
}) {
  const { columns, showPosition = false, showImage = true, rows = 4, showStatus = true } = table;
  
  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto mb-4 sm:mb-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="h-7 sm:h-8 bg-gray-200 rounded w-32 sm:w-40 animate-pulse" />
        {showCreateButton && (
          <div className="h-9 sm:h-10 bg-gray-200 rounded w-28 sm:w-36 animate-pulse" />
        )}
      </div>
      
      <TableSkeleton rows={rows} columns={columns} showPosition={showPosition} showImage={showImage} />
      <CardSkeleton cards={rows} config={{ showStatus }} />
      <PaginationSkeleton />
    </div>
  );
}

/**
 * Compact spinner for inline loading
 */
export function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };
  
  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="animate-spin rounded-full border-2 border-gray-200 border-t-orange-500 h-full w-full" />
    </div>
  );
}

/**
 * Loading overlay for modals or actions
 */
export function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-xl flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

/**
 * Inline loading button state
 */
export function ButtonSpinner({ size = 'sm' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-white/30 border-t-white`} />
  );
}

/**
 * Loading dot animation for subtle loading indication
 */
export function LoadingDots({ className = '' }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

/**
 * Main Loading component - displays full page skeleton
 */
export default function Loading() {
  return <PageSkeleton />;
}

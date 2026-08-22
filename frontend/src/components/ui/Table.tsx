import React, { useState, useMemo, createContext, useContext } from 'react';
import { ChevronUp, ChevronDown, ChevronUpDown } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';

interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  sticky?: boolean;
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

interface TableContextValue<T> {
  sortKey: string | null;
  sortDirection: SortDirection;
  onSort: (key: string) => void;
  selectedRows: Set<string>;
  onRowSelect: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  striped: boolean;
  hoverable: boolean;
}

const TableContext = createContext<TableContextValue<any> | null>(null);

const useTableContext = <T>() => {
  const ctx = useContext(TableContext) as TableContextValue<T> | null;
  if (!ctx) throw new Error('Table components must be used within a Table provider');
  return ctx;
};

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyAccessor: (row: T) => string;
  striped?: boolean;
  hoverable?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  emptyState?: {
    title: string;
    message: string;
    action?: { label: string; onClick: () => void };
  };
  loading?: boolean;
  loadingRows?: number;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyAccessor,
  striped = false,
  hoverable = true,
  selectable = false,
  onSelectionChange,
  emptyState,
  loading = false,
  loadingRows = 5,
  className = '',
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const handleSort = (key: string) => {
    const column = columns.find(c => c.key === key);
    if (!column?.sortable) return;

    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;
    const column = columns.find(c => c.key === sortKey);
    if (!column?.sortable) return data;

    return [...data].sort((a, b) => {
      const aVal = column.accessor(a);
      const bVal = column.accessor(b);
      const aStr = String(aVal);
      const bStr = String(bVal);
      const comparison = aStr.localeCompare(bStr, undefined, { numeric: true });
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection, columns]);

  const handleRowSelect = (id: string, selected: boolean) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      onSelectionChange?.(Array.from(next));
      return next;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const allIds = new Set(sortedData.map(keyAccessor));
      setSelectedRows(allIds);
      onSelectionChange?.(Array.from(allIds));
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };

  const contextValue: TableContextValue<T> = {
    sortKey,
    sortDirection,
    onSort: handleSort,
    selectedRows,
    onRowSelect: handleRowSelect,
    onSelectAll: handleSelectAll,
    striped,
    hoverable,
  };

  if (loading) {
    return (
      <div className={`overflow-x-auto ${className}`} role="table" aria-label="Data table">
        <div className="min-w-full divide-y divide-border-subtle">
          <div className="bg-surface-elevated">
            {columns.map((col) => (
              <div
                key={col.key}
                className={`px-4 py-3 text-overline font-semibold uppercase tracking-wider text-text-tertiary ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}
                style={{ width: col.width, minWidth: col.width }}
              >
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
          <div className="bg-surface-card">
            {Array.from({ length: loadingRows }).map((_, i) => (
              <div key={i} className="flex items-center">
                {columns.map((col) => (
                  <div
                    key={col.key}
                    className={`px-4 py-3 font-body-sm text-text-primary ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}
                    style={{ width: col.width, minWidth: col.width }}
                  >
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`overflow-x-auto ${className}`} role="table" aria-label="Data table">
        <div className="min-w-full">
          <EmptyState
            title={emptyState?.title || 'No data available'}
            message={emptyState?.message || 'There are no items to display.'}
            action={emptyState?.action}
          />
        </div>
      </div>
    );
  }

  return (
    <TableContext.Provider value={contextValue}>
      <div className={`overflow-x-auto ${className}`} role="table" aria-label="Data table">
        <div className="min-w-full divide-y divide-border-subtle">
          {/* Header */}
          <div className="bg-surface-elevated">
            {selectable && (
              <div className="flex items-center px-4 py-3 w-12">
                <input
                  type="checkbox"
                  checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                  indeterminate={selectedRows.size > 0 && selectedRows.size < sortedData.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-border-default text-brand-lime focus:ring-brand-lime focus:ring-2"
                  aria-label="Select all rows"
                />
              </div>
            )}
            {columns.map((col) => (
              <button
                key={col.key}
                type="button"
                onClick={() => col.sortable && handleSort(col.key)}
                disabled={!col.sortable}
                className={`
                  px-4 py-3 text-overline font-semibold uppercase tracking-wider text-text-tertiary
                  ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}
                  ${col.sortable ? 'hover:text-text-primary cursor-pointer transition-colors select-none' : ''}
                  ${col.className || ''}
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-inset
                `}
                style={{ width: col.width, minWidth: col.width }}
                aria-sort={sortKey === col.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center justify-center gap-1">
                  {col.header}
                  {col.sortable && (
                    <span className="flex-shrink-0">
                      {sortKey === col.key ? (
                        sortDirection === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                      ) : (
                        <ChevronUpDown size={10} className="text-text-quaternary" />
                      )}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="bg-surface-card">
            {sortedData.map((row, rowIndex) => {
              const rowKey = keyAccessor(row);
              const isSelected = selectedRows.has(rowKey);
              const isStriped = striped && rowIndex % 2 === 1;

              return (
                <div
                  key={rowKey}
                  className={`
                    flex items-center transition-colors duration-100
                    ${isSelected ? 'bg-brand-soft border-l-2 border-brand-lime' : ''}
                    ${isStriped ? 'bg-surface-hover/50' : ''}
                    ${hoverable && !isSelected ? 'hover:bg-surface-hover' : ''}
                  `}
                >
                  {selectable && (
                    <div className="flex items-center px-4 py-3 w-12">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleRowSelect(rowKey, e.target.checked)}
                        className="w-4 h-4 rounded border-border-default text-brand-lime focus:ring-brand-lime focus:ring-2"
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                    </div>
                  )}
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      className={`
                        px-4 py-3 font-body-sm text-text-primary
                        ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}
                        ${col.className || ''}
                        ${col.sticky ? 'sticky left-0 z-10 bg-surface-card' : ''}
                      `}
                      style={{ width: col.width, minWidth: col.width }}
                    >
                      {col.accessor(row)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </TableContext.Provider>
  );
}

interface TableBodyProps {
  children: React.ReactNode;
}

function TableBodyComponent({ children }: TableBodyProps) {
  return <div className="bg-surface-card">{children}</div>;
}

TableBodyComponent.displayName = 'TableBody';

interface TableRowProps<T> {
  children: React.ReactNode;
  className?: string;
}

function TableRowComponent<T>({ children, className = '' }: TableRowProps<T>) {
  return <div className={`flex items-center ${className}`}>{children}</div>;
}

TableRowComponent.displayName = 'TableRow';

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

function TableCellComponent({ children, className = '', align = 'left' }: TableCellProps) {
  return (
    <div className={`px-4 py-3 font-body-sm text-text-primary ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : ''} ${className}`}>
      {children}
    </div>
  );
}

TableCellComponent.displayName = 'TableCell';

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

function TableHeaderComponent({ children, className = '' }: TableHeaderProps) {
  return <div className={`bg-surface-elevated ${className}`}>{children}</div>;
}

TableHeaderComponent.displayName = 'TableHeader';

export const TableBody = TableBodyComponent;
export const TableRow = TableRowComponent;
export const TableCell = TableCellComponent;
export const TableHeader = TableHeaderComponent;
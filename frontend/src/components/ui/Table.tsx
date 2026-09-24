import React, { useState, useMemo, useCallback, useRef, useEffect, createContext, useContext } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';

interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number | Date | null | undefined;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  sticky?: boolean;
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

interface TableContextValue {
  sortKey: string | null;
  sortDirection: SortDirection;
  onSort: (key: string) => void;
  selectedRows: Set<string>;
  onRowSelect: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  striped: boolean;
  hoverable: boolean;
  selectable: boolean;
}

const TableContext = createContext<TableContextValue<unknown> | null>(null);

const useTableContext = () => {
  const ctx = useContext(TableContext) as TableContextValue | null;
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

function getSortValue<T>(column: Column<T>, row: T): string {
  if (column.sortValue) {
    const val = column.sortValue(row);
    return val == null ? '' : String(val);
  }
  const accessorVal = column.accessor(row);
  if (typeof accessorVal === 'string') return accessorVal;
  if (typeof accessorVal === 'number') return String(accessorVal);
  if (accessorVal instanceof Date) return accessorVal.toISOString();
  if (Array.isArray(accessorVal)) return accessorVal.map(String).join(',');
  if (accessorVal == null) return '';
  return String(accessorVal);
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

  const handleSort = useCallback((key: string) => {
    const column = columns.find(c => c.key === key);
    if (!column?.sortable) return;

    setSortKey(prevKey => {
      setSortDirection(prevDir => {
        if (prevKey === key) {
          if (prevDir === 'asc') return 'desc';
          if (prevDir === 'desc') return null;
          return 'asc';
        }
        return 'asc';
      });
      return prevKey === key && sortDirection === 'desc' ? null : key;
    });
  }, [columns, sortKey, sortDirection]);

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;
    const column = columns.find(c => c.key === sortKey);
    if (!column?.sortable) return data;

    return [...data].sort((a, b) => {
      const aStr = getSortValue(column, a);
      const bStr = getSortValue(column, b);
      const comparison = aStr.localeCompare(bStr, undefined, { numeric: true });
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection, columns]);

  const handleRowSelect = useCallback((id: string, selected: boolean) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      onSelectionChange?.(Array.from(next));
      return next;
    });
  }, [onSelectionChange]);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      const allIds = new Set(data.map(keyAccessor));
      setSelectedRows(allIds);
      onSelectionChange?.(Array.from(allIds));
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  }, [data, keyAccessor, onSelectionChange]);

  const contextValue = useMemo<TableContextValue>(() => ({
    sortKey,
    sortDirection,
    onSort: handleSort,
    selectedRows,
    onRowSelect: handleRowSelect,
    onSelectAll: handleSelectAll,
    striped,
    hoverable,
    selectable,
  }), [sortKey, sortDirection, handleSort, selectedRows, handleRowSelect, handleSelectAll, striped, hoverable, selectable]);

  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedRows.size > 0 && selectedRows.size < data.length;
    }
  }, [selectedRows, data.length]);

  const renderHeader = () => (
    <div className="bg-surface-elevated" role="row">
      {selectable && (
        <div className="flex items-center px-4 py-3 w-12" role="cell">
          <input
            ref={selectAllRef}
            type="checkbox"
            checked={selectedRows.size === data.length && data.length > 0}
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
          role="columnheader"
          tabIndex={col.sortable ? 0 : -1}
        >
          <div className="flex items-center justify-center gap-1">
            {col.header}
            {col.sortable && (
              <span className="flex-shrink-0" aria-hidden="true">
                {sortKey === col.key ? (
                  sortDirection === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                ) : (
                  <ChevronsUpDown size={10} className="text-text-quaternary" />
                )}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );

  const renderBody = () => (
    <div className="bg-surface-card" role="rowgroup">
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
              ${selectable ? 'cursor-pointer' : ''}
            `}
            role="row"
            onClick={selectable ? () => handleRowSelect(rowKey, !isSelected) : undefined}
          >
            {selectable && (
              <div className="flex items-center px-4 py-3 w-12" role="cell">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleRowSelect(rowKey, e.target.checked);
                  }}
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
                role="cell"
              >
                {col.accessor(row)}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className={`overflow-x-auto ${className}`} role="table" aria-label="Data table" aria-busy="true">
        <div className="min-w-full divide-y divide-border-subtle">
          <div className="bg-surface-elevated" role="rowgroup">
            {renderHeader().props.children}
          </div>
          <div className="bg-surface-card" role="rowgroup">
            {Array.from({ length: loadingRows }).map((_, i) => (
              <div key={i} className="flex items-center" role="row">
                {columns.map((col) => (
                  <div
                    key={col.key}
                    className={`px-4 py-3 font-body-sm text-text-primary ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}
                    style={{ width: col.width, minWidth: col.width }}
                    role="cell"
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
          <div className="bg-surface-elevated" role="rowgroup">
            {renderHeader().props.children}
          </div>
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
        <div className="min-w-full divide-y divide-border-subtle relative">
          <div role="rowgroup">
            {renderHeader()}
          </div>
          {renderBody()}
        </div>
      </div>
    </TableContext.Provider>
  );
}

interface TableBodyProps {
  children: React.ReactNode;
}

const TableBody = ({ children }: TableBodyProps) => (
  <div className="bg-surface-card" role="rowgroup">{children}</div>
);

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
}

const TableRow = ({ children, className = '', selected, striped, hoverable, onClick }: TableRowProps) => (
  <div
    className={`
      flex items-center transition-colors duration-100
      ${selected ? 'bg-brand-soft border-l-2 border-brand-lime' : ''}
      ${striped ? 'bg-surface-hover/50' : ''}
      ${hoverable && !selected ? 'hover:bg-surface-hover' : ''}
      ${onClick ? 'cursor-pointer' : ''}
      ${className}
    `}
    role="row"
    onClick={onClick}
  >
    {children}
  </div>
);

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
  width?: string;
}

const TableCell = ({ children, className = '', align = 'left', sticky, width }: TableCellProps) => (
  <div
    className={`
      px-4 py-3 font-body-sm text-text-primary
      ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : ''}
      ${sticky ? 'sticky left-0 z-10 bg-surface-card' : ''}
      ${className}
    `}
    style={{ width, minWidth: width }}
    role="cell"
  >
    {children}
  </div>
);

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const TableHeader = ({ children, className = '' }: TableHeaderProps) => (
  <div className={`bg-surface-elevated ${className}`} role="rowgroup">{children}</div>
);

export { TableBody, TableRow, TableCell, TableHeader };
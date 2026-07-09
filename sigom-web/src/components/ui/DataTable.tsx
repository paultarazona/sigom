import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
  emptyMessage?: string
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No hay datos para mostrar.',
}: DataTableProps<T>) {
  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead className="data-table__head">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`data-table__th${col.className ? ` ${col.className}` : ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="data-table__body">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="data-table__empty"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const isClickable = !!onRowClick
              return (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  role={isClickable ? 'button' : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onKeyDown={
                    isClickable
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onRowClick(row)
                          }
                        }
                      : undefined
                  }
                  className={`data-table__row${isClickable ? ' data-table__row--clickable' : ''}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`data-table__td${col.className ? ` ${col.className}` : ''}`}
                    >
                      <span className="data-table__td-label">{col.header}</span>
                      <span className="data-table__td-value">{col.render(row)}</span>
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

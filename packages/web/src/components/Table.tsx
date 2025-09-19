/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo, useCallback } from "react";

export interface TableColumn {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: any) => React.ReactNode;
}

export interface TableProps {
  columns: TableColumn[];
  data: any[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
  className?: string;
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No data available",
  onRowClick,
  className = "",
}) => {
  // Render table headers
  const renderTableHeaders = useCallback(
    () => (
      <thead>
        <tr className="border-b border-gray-200">
          {columns.map((column) => (
            <th
              key={column.key}
              className={`px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider ${
                column.align === "center"
                  ? "text-center"
                  : column.align === "right"
                  ? "text-right"
                  : "text-left"
              }`}
              style={{ width: column.width }}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
    ),
    [columns]
  );

  // Handle row click
  const handleRowClick = useCallback(
    (row: any) => {
      onRowClick?.(row);
    },
    [onRowClick]
  );

  // Render table body content based on state
  const renderTableBody = useCallback(() => {
    if (isLoading) {
      return (
        <tbody className="divide-y divide-gray-200">
          <tr>
            <td colSpan={columns.length} className="px-4 py-4 text-center">
              Loading...
            </td>
          </tr>
        </tbody>
      );
    }

    if (data.length === 0) {
      return (
        <tbody className="divide-y divide-gray-200">
          <tr>
            <td
              colSpan={columns.length}
              className="px-4 py-4 text-center text-black/50"
            >
              {emptyMessage}
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody className="divide-y divide-gray-200">
        {data.map((row, index) => (
          <tr
            key={index}
            className={
              onRowClick
                ? "hover:bg-gray-50 cursor-pointer"
                : "hover:bg-gray-50"
            }
            onClick={() => handleRowClick(row)}
          >
            {columns.map((column) => (
              <td
                key={column.key}
                className={`px-4 py-4 whitespace-nowrap ${
                  column.align === "center"
                    ? "text-center"
                    : column.align === "right"
                    ? "text-right"
                    : "text-left"
                }`}
              >
                {column.render ? (
                  column.render(row[column.key], row)
                ) : (
                  <p className="text-black">{row[column.key]}</p>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  }, [isLoading, data, columns, emptyMessage, onRowClick, handleRowClick]);

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full">
        {renderTableHeaders()}
        {renderTableBody()}
      </table>
    </div>
  );
};

export default memo(Table);

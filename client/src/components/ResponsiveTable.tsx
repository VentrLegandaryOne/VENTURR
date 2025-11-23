import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  mobileLabel?: string; // Label to show on mobile card view
  hideOnMobile?: boolean; // Hide this column on mobile
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

/**
 * ResponsiveTable Component
 * 
 * Automatically switches between table view (desktop/tablet) and card view (mobile)
 * for better mobile UX
 */
export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = "No data available",
  className,
}: ResponsiveTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop/Tablet Table View */}
      <div className={cn("hidden md:block overflow-x-auto", className)}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="text-left px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "border-b border-slate-100 hover:bg-slate-50 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm text-slate-600">
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            onClick={() => onRowClick?.(item)}
            className={cn(
              "bg-white border border-slate-200 rounded-lg p-4 shadow-sm",
              onRowClick && "active:bg-slate-50 cursor-pointer"
            )}
          >
            {columns
              .filter((col) => !col.hideOnMobile)
              .map((column) => (
                <div key={column.key} className="flex justify-between items-start py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm font-medium text-slate-700 mr-3">
                    {column.mobileLabel || column.header}:
                  </span>
                  <span className="text-sm text-slate-600 text-right flex-1">
                    {column.render(item)}
                  </span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Example usage:
 * 
 * const columns: Column<Project>[] = [
 *   {
 *     key: "name",
 *     header: "Project Name",
 *     mobileLabel: "Name",
 *     render: (project) => project.name,
 *   },
 *   {
 *     key: "status",
 *     header: "Status",
 *     render: (project) => <Badge>{project.status}</Badge>,
 *   },
 *   {
 *     key: "date",
 *     header: "Created",
 *     mobileLabel: "Date",
 *     hideOnMobile: true, // Hide on mobile
 *     render: (project) => formatDate(project.createdAt),
 *   },
 * ];
 * 
 * <ResponsiveTable
 *   data={projects}
 *   columns={columns}
 *   keyExtractor={(p) => p.id}
 *   onRowClick={(p) => navigate(`/projects/${p.id}`)}
 *   emptyMessage="No projects found"
 * />
 */


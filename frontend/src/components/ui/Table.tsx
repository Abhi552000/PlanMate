import React from "react";

export interface TableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const TableCard: React.FC<TableCardProps> = ({
  children,
  className = "",
  ...props
}) => (
  <div
    className={`bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-2xl shadow-2xs overflow-hidden ${className}`}
    {...props}
  >
    {children}
  </div>
);
TableCard.displayName = "TableCard";

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  className?: string;
  wrapperClassName?: string;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className = "", wrapperClassName = "", children, ...props }, ref) => (
    <div className={`overflow-x-auto scrollbar-thin ${wrapperClassName}`}>
      <table
        ref={ref}
        className={`w-full text-left border-collapse ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  )
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className = "", ...props }, ref) => (
  <thead
    ref={ref}
    className={`border-b border-gray-100 dark:border-gray-800 text-[10px] sm:text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/60 dark:bg-gray-950/40 whitespace-nowrap ${className}`}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className = "", ...props }, ref) => (
  <tbody
    ref={ref}
    className={`divide-y divide-gray-100 dark:divide-gray-800 text-[11px] sm:text-xs ${className}`}
    {...props}
  />
));
TableBody.displayName = "TableBody";

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className = "", ...props }, ref) => (
  <tr
    ref={ref}
    className={`hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors whitespace-nowrap ${className}`}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className = "", ...props }, ref) => (
  <th
    ref={ref}
    className={`px-3 sm:px-5 py-3 font-bold ${className}`}
    {...props}
  />
));
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className = "", ...props }, ref) => (
  <td
    ref={ref}
    className={`px-3 sm:px-5 py-3.5 ${className}`}
    {...props}
  />
));
TableCell.displayName = "TableCell";

export interface TableEmptyProps {
  colSpan: number;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const TableEmpty: React.FC<TableEmptyProps> = ({
  colSpan,
  message = "No records found",
  icon,
  action,
  className = "",
}) => (
  <tr>
    <td colSpan={colSpan} className={`px-5 py-12 text-center ${className}`}>
      <div className="flex flex-col items-center justify-center gap-2">
        {icon && <div className="text-gray-400 dark:text-gray-500 mb-1">{icon}</div>}
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{message}</p>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </td>
  </tr>
);
TableEmpty.displayName = "TableEmpty";

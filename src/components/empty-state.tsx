import type { ReactNode } from "react";
import { Search } from "lucide-react";

type EmptyStateProps = {
  title?: string;
  message?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export const EmptyState = ({
  title = "No items found",
  message = "Try adjusting your search or filters",
  icon,
  action,
}: EmptyStateProps) => {
  const defaultIcon = icon ?? <Search size={48} className="text-gray-400" />;

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="flex justify-center">{defaultIcon}</div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-center text-sm text-gray-600 max-w-sm">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  message?: string;
};

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

export const LoadingSpinner = ({
  size = "md",
  message = "Loading...",
}: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-blue-500`}
        aria-label="Loading"
      />
      {message && <p className="text-gray-600">{message}</p>}
    </div>
  );
};

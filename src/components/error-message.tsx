type ErrorMessageProps = {
  message?: string;
  onRetry?: () => void;
  error?: Error;
  resetErrorBoundary?: () => void;
};

export const ErrorMessage = ({
  message,
  onRetry,
  error,
  resetErrorBoundary,
}: ErrorMessageProps) => {
  const displayMessage = message || error?.message || "Something went wrong. Please try again.";
  const retryHandler = onRetry || resetErrorBoundary;

  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-lg bg-red-50 p-8 text-red-800"
      role="alert"
    >
      <div className="text-2xl">⚠️</div>
      <p className="text-center text-sm font-medium">{displayMessage}</p>
      {retryHandler && (
        <button
          onClick={retryHandler}
          className="mt-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label="Retry loading"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

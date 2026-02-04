import { useState, useCallback } from "react";

type SearchBarProps = {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
};

export const SearchBar = ({
  onSearch,
  placeholder = "Search cryptocurrencies...",
  debounceMs = 300,
}: SearchBarProps) => {
  const [value, setValue] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(
    null
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Set new timer
      const timer = setTimeout(() => {
        onSearch(newValue);
      }, debounceMs);

      setDebounceTimer(timer);
    },
    [onSearch, debounceMs, debounceTimer]
  );

  const handleClear = useCallback(() => {
    setValue("");
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    onSearch("");
  }, [onSearch, debounceTimer]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        aria-label="Search cryptocurrencies"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        🔍
      </span>
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
};

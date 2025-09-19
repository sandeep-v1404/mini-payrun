import React, { useState, useMemo, useRef, useEffect, memo } from "react";

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  label?: string;
  error?: string;
  clearable?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
  label,
  error,
  clearable = true,
}) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.id === value),
    [value, options]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    onChange(id);
    setSearch("");
    setIsOpen(false);
  };

  const handleUnselect = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the dropdown
    onChange("");
    setSearch("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setSearch(""); // Clear search when focusing to show all options
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    } else if (e.key === "Enter" && filtered.length > 0) {
      handleSelect(filtered[0].id);
    } else if (e.key === "Tab") {
      setIsOpen(false);
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Only open if clicking on the container itself, not the input or clear button
    if (e.target === e.currentTarget) {
      setIsOpen(true);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={`w-full p-2 border rounded-md cursor-text bg-white flex items-center
          ${
            error
              ? "border-red-500"
              : isOpen
              ? "border-blue-500 ring-1 ring-blue-500"
              : "border-gray-300"
          }`}
        onClick={handleContainerClick}
      >
        {!isOpen && value ? (
          <div className="flex items-center justify-between w-full">
            <div
              className="truncate flex-1 text-black"
              onClick={() => setIsOpen(true)}
            >
              {selectedOption?.label}
            </div>
            {clearable && (
              <button
                type="button"
                className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={handleUnselect}
                aria-label="Clear selection"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center w-full">
            <input
              ref={inputRef}
              type="text"
              className="outline-none w-full bg-transparent text-black"
              placeholder={placeholder}
              value={search}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
            />
            {clearable && value && (
              <button
                type="button"
                className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={handleUnselect}
                aria-label="Clear selection"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        <svg
          className={`w-5 h-5 text-gray-400 ml-2 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          onClick={() => setIsOpen(!isOpen)}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 border rounded-md bg-white shadow-lg max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-3 text-gray-500 text-center">
              No results found
            </div>
          ) : (
            <>
              {clearable && value && (
                <div
                  className="px-3 py-2 cursor-pointer transition-colors text-gray-500 hover:bg-gray-100"
                  onClick={() => handleUnselect({} as React.MouseEvent)}
                >
                  Clear selection
                </div>
              )}
              {filtered.map((opt) => (
                <div
                  key={opt.id}
                  className={`px-3 py-2 cursor-pointer transition-colors text-black
                    ${
                      value === opt.id
                        ? "bg-blue-100 text-blue-800"
                        : "hover:bg-gray-100"
                    }`}
                  onClick={() => handleSelect(opt.id)}
                >
                  {opt.label}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Hidden select for form validation */}
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute opacity-0 w-0 h-0"
      >
        <option value=""></option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default memo(SearchableSelect);

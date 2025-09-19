/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useRef } from "react";
import dayjs from "dayjs";

const Input = ({
  type = "text",
  placeholder = "",
  value,
  onChange,
  required = false,
  className = "text-black",
  ...rest
}: {
  type?: string;
  placeholder?: string;
  value: any; // string | Date
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Base classes
  const baseClasses =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white";

  // Type-specific styles
  const typeStyles: Record<string, string> = {
    text: "text-black placeholder-gray-400",
    date: "text-gray-700 cursor-pointer [appearance:none] ",
    time: "text-gray-700 cursor-pointer [appearance:none] ",
    password: "tracking-widest",
    number: "text-left",
  };

  // Format date value correctly if type="date"
  const formattedValue = useMemo(
    () =>
      type === "date" && value
        ? dayjs(value).format("YYYY-MM-DD")
        : value ?? "",
    [type, value]
  );

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type={type}
        placeholder={placeholder}
        value={formattedValue}
        onChange={onChange}
        required={required}
        className={`${baseClasses} ${typeStyles[type] || ""} ${className}`}
        {...rest}
      />
    </div>
  );
};

export default Input;

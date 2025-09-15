/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from "react";
import { Calendar, Clock } from "lucide-react";

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
  value: any;
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
    date: "text-gray-700 cursor-pointer [appearance:none] pr-10",
    time: "text-gray-700 cursor-pointer [appearance:none] pr-10",
    password: "tracking-widest",
    number: "text-right",
  };

  // Choose icon
  const Icon = type === "date" ? Calendar : type === "time" ? Clock : null;

  const handleIconClick = () => {
    if (inputRef.current) {
      // Modern browsers (Chrome, Edge) support this
      if ("showPicker" in inputRef.current) {
        (inputRef.current as any).showPicker();
      } else {
        // Fallback → focus input (Safari/Firefox)
        inputRef.current?.focus();
      }
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`${baseClasses} ${typeStyles[type] || ""} ${className}`}
        {...rest}
      />
      {Icon && (
        <Icon
          size={18}
          onClick={handleIconClick}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
        />
      )}
    </div>
  );
};

export default Input;

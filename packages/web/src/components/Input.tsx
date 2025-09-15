/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

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
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${className}`}
    {...rest}
  />
);

export default Input;

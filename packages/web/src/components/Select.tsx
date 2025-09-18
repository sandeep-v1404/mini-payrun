import React from "react";

const Select = ({
  value,
  onChange,
  children,
  className = "text-black",
  ...rest
}: {
  value: any;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
};

export default Select;

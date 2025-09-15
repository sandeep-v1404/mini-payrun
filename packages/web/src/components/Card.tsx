import React from "react";

const Card = ({
  children,
  className = "",
  title,
  subtitle,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}) => (
  <div
    className={`bg-white rounded-xl shadow-lg border border-gray-100 ${className}`}
  >
    {(title || subtitle) && (
      <div className="p-6 border-b border-gray-100">
        {title && (
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        )}
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

export default Card;

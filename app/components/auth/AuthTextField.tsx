import React, { useState } from "react";
import { LucideIcon, Eye, EyeOff } from "lucide-react";

const AuthTextField = ({
  title,
  placeholder,
  type,
  icon: Icon,
  value,
  onChange,
}: {
  title: string;
  placeholder: string;
  type: string;
  icon: LucideIcon;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === "password";

  const currentType = isPasswordField
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <div className="w-full space-y-1.5">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">
        {title}
      </label>
      <div className="relative group">
        {/* Left Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
        </div>

        {/* Input Field */}
        <input
          type={currentType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`block w-full pl-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all ${
            isPasswordField ? "pr-10" : "pr-3"
          }`}
        />

        {/* Right Icon (Eye Toggle) - Only for password fields */}
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-amber-500 transition-colors focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthTextField;

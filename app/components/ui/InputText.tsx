import { LucideIcon } from "lucide-react";
import React from "react";

const InputText = ({
  placeholder,
  Icon,
  type,
  value,
  onChange,
}: {
  placeholder: string;
  Icon: LucideIcon;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div className="p-2 flex gap-2 items-center w-full focus-within:border-amber-400 focus-within:border-2 bg-gray-200 border border-gray-300 rounded-md">
      <Icon className="w-4 h-4 stroke-gray-500" />
      <input
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className="outline-none w-full text-[11px]"
      />
    </div>
  );
};

export default InputText;

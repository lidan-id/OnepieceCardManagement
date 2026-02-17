import React from "react";
import InputText from "../ui/InputText";
import { LucideIcon } from "lucide-react";

const AuthTextField = ({
  title,
  placeholder,
  type,
  icon,
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
  return (
    <div className="w-full mb-3">
      <p className="text-[11px] mb-1">{title}</p>
      <InputText
        placeholder={placeholder}
        Icon={icon}
        type={type}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default AuthTextField;

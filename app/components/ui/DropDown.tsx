"use client";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

const DropDown = ({
  listItem,
  setSelectedColor,
}: {
  listItem: string[];
  setSelectedColor: (value: string) => void;
}) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      onClick={() => {
        setIsOpen(!isOpen);
      }}
      className="cursor-pointer relative border text-[11px] w-full justify-between p-1.5 border-gray-400 rounded-md flex gap-2 items-center"
    >
      <p>
        {selectedItemIndex === -1 ? "All Colors" : listItem[selectedItemIndex]}
      </p>
      <ChevronDown className="w-3 h-3" />
      {isOpen && (
        <div className="absolute top-[110%] shadow-lg bg-white w-full left-0 rounded-md z-10 p-1">
          {listItem.map((item, index) => (
            <div
              onClick={() => {
                setSelectedItemIndex(index);
                setSelectedColor(listItem[index]);
              }}
              key={index}
              className="p-1 hover:bg-amber-400 rounded-sm flex items-center gap-1"
            >
              {selectedItemIndex === index ? (
                <Check className="w-3 h-3" />
              ) : (
                <div className="w-3"></div>
              )}
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropDown;

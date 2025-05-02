import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'

interface ButtonProps {
  label: string;
  icon?: IconDefinition; 
  iconColor?: string;    
  specifyBackground: string;
  action?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "submit" | "reset" | "button";
}

const findBackgroundColor = (specifyBackground: string) => {
  if (specifyBackground === "none") {
    return "";
  } else {
    return specifyBackground || "bg-pink-600";
  }
}

const Button: React.FC<ButtonProps> = ({
  label,
  icon,
  iconColor = "white",
  specifyBackground,
  action,
  type = "button"
}) => {

  const backgroundColor = findBackgroundColor(specifyBackground);

  return (
    <button
      onClick={action}
      type={type}
      className={`flex items-center px-3 py-1 mt-1 ${backgroundColor} hover:opacity-90 cursor-pointer rounded-lg text-white`}
    >
      {icon && (
        <FontAwesomeIcon icon={icon} className="mr-2" color={iconColor} />
      )}
      {label}
    </button>
  );
};

export default Button;

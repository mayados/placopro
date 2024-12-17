import React from 'react'
// On importe le type LucideIcon pour pouvoir faire passer l'icone voulue
import {LucideIcon} from 'lucide-react'


interface ButtonProps {
  label:string;
  icon: LucideIcon;
  iconFill?: string ;
  specifyBackground: string;
  action?: (e: React.MouseEvent<HTMLButtonElement>) => void; 
  type?:  "submit" | "reset" | "button" | undefined;
}

const findBackgroundColor =  (specifyBackground: string)  => {
  if(specifyBackground === "none"){
    return "";
  } else{
    return "bg-pink-600"
  }

}

const Button:React.FC<ButtonProps> = ({label, icon: Icon, specifyBackground, action, type, iconFill=""}) => {

  const backgroundColor = findBackgroundColor(specifyBackground);

  return (
        <button onClick={action} type={type} className={`flex items-center px-3 py-1 mt-1 ${backgroundColor} from-white hover:bg-pink-500 cursor-pointer rounded-lg`}>
            <Icon className="mx-2" fill={iconFill} /> 
            {label} 
        </button>
    )    

}

export default Button
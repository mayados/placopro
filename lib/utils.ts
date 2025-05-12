/**
 * @jest-environment jsdom
 */

import { format } from "date-fns";
import { v4 as uuidv4 } from 'uuid';


// Display date on french format, without hours
// export function formatDate(date: Date): string{
//     return format(new Date(date), "dd/MM/yyyy") ?? "Date non disponible";
// }
export function formatDate(date: Date | string | null | undefined): string {
  
  // console.log("Type:", typeof date, "Value:", date);


  if (!date) return "Date non disponible";
  
  // Si c'est déjà un objet Date, utilisez-le directement
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Vérifiez si la date est valide
  if (isNaN(dateObj.getTime())) {
    return "Date non disponible";
  }
  
  return format(dateObj, "dd/MM/yyyy");
}

// Format date for <input type="date">
export function formatDateToInput(date: Date): string {
  return format(new Date(date), "yyyy-MM-dd");
}

export function generateUniqueClientNumber(prospect?: string) {

  if(prospect){
    return `PROS-${uuidv4()}`;  

  }
  return `CL-${uuidv4()}`;  
}

// Capitalize first letter of a string
export function capitalizeFirstLetter(word: string){
  // retrieve the first letter of the word, put it to upperCase and add the remaining letters of the word
  const capitalizedFirstLetterWord = word.charAt(0).toUpperCase()+ word.slice(1)
  return capitalizedFirstLetterWord;
}

// HTML inputs of type Date are waiting a specific format which is : YYYY-MM-DD
// We can use this function when we need to retrieve a date from the database
export function formatDateForInput(date: string | Date | null): string {
  // If there isn't a date, we return an empty string
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// utils/generateSlug.ts
export function generateSlug(prefix: string) {
  const id = uuidv4(); 
  return `${prefix}-${id}`; 
}



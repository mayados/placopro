import { format } from "date-fns";

// Display date on french format, without hours
export function formatDate(date: Date): string{
    return format(new Date(date), "dd/MM/yyyy") ?? "Date non disponible";
}

// Format date for <input type="date">
export function formatDateToInput(date: Date): string {
  return format(new Date(date), "yyyy-MM-dd");
}

// Allows to create a slug thanks to a string
export function slugify(str: string): string {
  // Trim leading/trailing white spaces
  str = str.trim();
  // Convert string to lowercase
  str = str.toLowerCase();
  // Remove accents
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Remove any non-alphanumeric characters except spaces and hyphens
  str = str.replace(/[^a-z0-9 -]/g, '');
  // Replace spaces with hyphens
  str = str.replace(/\s+/g, '-');
  // Remove consecutive hyphens
  str = str.replace(/-+/g, '-');
  // delete '-' in the beginning or the end of the string
  str = str.replace(/^-+|-+$/g, '');
  
  return str;
}


  const usedClientNumbers: Set<string> = new Set();

  export function generateUniqueClientNumber() {
    let clientNumber;
    
    do {
      const randomNumber = Math.floor(Math.random() * 1000000); // Génère un nombre aléatoire
      clientNumber = `CL-${randomNumber.toString().padStart(6, '0')}`;
    } while (usedClientNumbers.has(clientNumber)); // Vérifie si le numéro existe déjà
    
    usedClientNumbers.add(clientNumber); // Ajoute le numéro à l'ensemble des numéros utilisés
    return clientNumber;
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


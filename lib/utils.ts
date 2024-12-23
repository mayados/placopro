import { format } from "date-fns";

// Display date on french format, without hours
export function formatDate(date: Date): string{
    return format(new Date(date), "d/MM/yyyy") ?? "Date non disponible";
}

// Allows to create a slug thanks to a string
export function slugify(str: string): string {
    // trim leading/trailing white space
    str = str.replace(/^\s+|\s+$/g, ''); 
    // convert string to lowercase
    str = str.toLowerCase(); 
    // remove accents
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); 
    // remove any non-alphanumeric characters    
    str = str.replace(/[^a-z0-9 -]/g, '') 
            // replace spaces with hyphens    
             .replace(/\s+/g, '-') 
            // remove consecutive hyphens             
             .replace(/-+/g, '-'); 
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
  

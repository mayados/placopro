/* eslint-disable */

import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// Fonction utilitaire pour assainir les données (lutte xss)
export function sanitizeData(data: any) {
    // Si l'environnement est Node.js, on utilise jsdom pour simuler un objet window
    const { window } = new JSDOM("");
    const purify = DOMPurify(window);
  
    // Si data est un objet, on boucle sur tous ses champs pour purifier le texte
    if (data && typeof data === "object") {
      Object.keys(data).forEach((key) => {
        if (typeof data[key] === "string") {
          // Purifier uniquement les chaînes de caractères
          data[key] = purify.sanitize(data[key]);
        } else if (typeof data[key] === "object") {
          // Si c'est un sous-objet, on appelle récursivement sanitizeData
          data[key] = sanitizeData(data[key]);
        }
      });
    }
  
    return data;
  }

// import DOMPurify from "dompurify";
// import { JSDOM } from "jsdom";

// /**
//  * Fonction utilitaire pour assainir récursivement les champs string d'un objet (contre XSS).
//  * Elle conserve le type original de l'objet en sortie.
//  */
// export function sanitizeData<T extends object>(data: T): T {
//   const { window } = new JSDOM("");
//   const purify = DOMPurify(window);

//   for (const key of Object.keys(data) as (keyof T)[]) {
//     const value = data[key];

//     if (typeof value === "string") {
//       data[key] = purify.sanitize(value) as T[keyof T];
//     } else if (
//       value !== null &&
//       typeof value === "object" &&
//       !Array.isArray(value)
//     ) {
//       // Cast nécessaire ici pour forcer TypeScript à accepter value comme objet
//       data[key] = sanitizeData(value as Record<string, unknown>) as T[keyof T];
//     }
//   }

//   return data;
// }

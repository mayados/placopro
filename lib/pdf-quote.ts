import { jsPDF } from "jspdf";


export async function generateQuotePDF(quote: any): Promise<Buffer> {
  const doc = new jsPDF();
  
  // HEADER - centrer le texte
  doc.setFontSize(20);
  doc.text('DEVIS', doc.internal.pageSize.width / 2, 30, { align: 'center' });

  // Informations générales
  doc.setFontSize(12);
  doc.text(`Numéro du devis : ${quote.number}`, 40, 60);

  // Client
  if (quote.clientBackup) {
    const client = quote.clientBackup;
    const clientAddressLine1 = [client.addressNumber, client.road, client.additionalAddress].filter(Boolean).join(' ');
    const clientAddressLine2 = [client.postalCode, client.city].filter(Boolean).join(' ');
    doc.setFontSize(14);
    doc.text('Informations client', 40, 100);
    doc.setFontSize(12);
    doc.text(`Nom : ${client.name || ''}`, 40, 110);
    doc.text(`Email : ${client.mail || ''}`, 40, 120);
    doc.text(`Adresse :`, 40, 130);
    doc.text(clientAddressLine1, 40, 140);
    doc.text(clientAddressLine2, 40, 150);
  }

  // Chantier
  if (quote.workSiteBackup) {
    const workSite = quote.workSiteBackup;
    const workSiteAddressLine1 = [workSite.addressNumber, workSite.road, workSite.additionalAddress].filter(Boolean).join(' ');
    const workSiteAddressLine2 = [workSite.postalCode, workSite.city].filter(Boolean).join(' ');
    doc.setFontSize(14);
    doc.text('Chantier', 40, 160);
    doc.setFontSize(12);
    doc.text(`Adresse du chantier :`, 40, 170);
    doc.text(workSiteAddressLine1, 40, 180);
    doc.text(workSiteAddressLine2, 40, 190);
  }

  // Description des travaux
  doc.setFontSize(14);
  doc.text('Travaux', 40, 200);
  doc.setFontSize(12);
  doc.text(`Nature : ${quote.natureOfWork}`, 40, 210);
  doc.text(`Description : ${quote.description || 'N/A'}`, 40, 220);

// Services
doc.setFontSize(14);
doc.text('Détails des prestations', 40, 250);
const services = quote.servicesBackup || [];
let yPosition = 260;

if (services.length > 0) {
  services.forEach((service: any) => {
    // Vérification des données et accès aux bonnes propriétés
    if (service.label && !isNaN(service.unitPriceHT) && !isNaN(service.quantity)) {
      const totalHT = service.unitPriceHT * service.quantity;
      
      // Si yPosition dépasse la limite de la page (par exemple 270 pour la page A4)
      if (yPosition > 270) {
        doc.addPage();  // Ajoute une nouvelle page
        yPosition = 20; // Réinitialise la position sur la nouvelle page
      }

      doc.setFontSize(12);
      doc.text(service.label, 40, yPosition);  // Utilisation de 'label' au lieu de 'name'
      doc.text(`${service.quantity.toString()}`, 150, yPosition);
      doc.text(`${service.unitPriceHT.toFixed(2)} €`, 250, yPosition);  // Utilisation de 'unitPriceHT'
      doc.text(`${totalHT.toFixed(2)} €`, 350, yPosition);
      
      // Mise à jour de la position pour chaque service
      yPosition += 10;
    } else {
      console.log('Erreur dans le service:', service);
      doc.text('Service mal formé (nom manquant ou prix/quantité invalides)', 40, yPosition);
      yPosition += 10;
    }
  });
} else {
  doc.text('Aucune prestation enregistrée.', 40, yPosition);
  yPosition += 10;
}

// Totaux
doc.setFontSize(14);
doc.text('Récapitulatif', 40, yPosition);
yPosition += 10;
doc.setFontSize(12);
doc.text(`Total HT : ${quote.priceHT.toFixed(2)} €`, 40, yPosition);
doc.text(`TVA : ${quote.vatAmount.toFixed(2)} €`, 40, yPosition + 10);
doc.text(`Total TTC : ${quote.priceTTC.toFixed(2)} €`, 40, yPosition + 20);
doc.text(`Frais de déplacement : ${quote.travelCosts.toFixed(2)} €`, 40, yPosition + 30);
doc.text(`Acompte demandé : ${quote.depositAmount?.toFixed(2) || '0.00'} €`, 40, yPosition + 40);


  // Conditions de paiement
  doc.setFontSize(14);
  doc.text('Conditions de paiement', 40, yPosition + 50);
  doc.setFontSize(12);
  doc.text(`Délai : ${quote.paymentDelay} jours`, 40, yPosition + 60);
  doc.text(`Conditions : ${quote.paymentTerms}`, 40, yPosition + 70);
  doc.text(`Pénalités de retard : ${quote.latePaymentPenalties || 0}%`, 40, yPosition + 80);
  doc.text(`Frais de recouvrement : ${quote.recoveryFee?.toFixed(2) || '0.00'} €`, 40, yPosition + 90);

  // Sauvegarde du PDF dans un buffer
  const pdfBuffer = doc.output('arraybuffer');
  return Buffer.from(pdfBuffer);
}

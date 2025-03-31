import React from "react";
import jsPDF from "jspdf";
// import autoTable from 'jspdf-autotable'
import 'jspdf-autotable'
import { formatDate } from '@/lib/utils'
import { UserOptions } from 'jspdf-autotable';


interface jsPDFCustom extends jsPDF {
  autoTable: (options: UserOptions) => void;
}

interface DownloadBillPDFProps {
  bill: BillType; 
  company: CompanyType; 
  vatAmountTravelCost: number; 
  priceTTCTravelCost: number;
}


const DownloadBillPDF: React.FC<DownloadBillPDFProps> = ({ bill, company, vatAmountTravelCost, priceTTCTravelCost }) => {
  const generatePDF = () => {
    const doc = new jsPDF() as jsPDFCustom;
    
    // Title
    doc.setFontSize(18);
    doc.text(`Devis ${bill?.number}`, 105, 20, { align: "center" });

    // Emetteur section
    doc.setFontSize(14);
    doc.text("Émetteur :", 10, 30);
    doc.setFontSize(12);
    doc.text(`${company?.name}`, 10, 35);
    doc.text(`Téléphone : ${company?.phone}`, 10, 40);
    doc.text(`Email : ${company?.mail}`, 10, 45);
    doc.text(`Adresse : ${company?.addressNumber} ${company?.road} ${company?.city} ${company?.postalCode} ${company?.additionnalAddress}`, 10, 50);

    // Destinataire section
    doc.setFontSize(14);
    doc.text("Adressé à :", 10, 60);
    doc.setFontSize(12);
    doc.text(`${bill?.client?.name} ${bill?.client?.firstName}`, 10, 65);
    doc.text(`${bill?.client?.addressNumber} ${bill?.client?.road} ${bill?.client?.postalCode} ${bill?.client?.city}`, 10, 70);

    // Chantier section
    doc.setFontSize(14);
    doc.text("Informations du chantier :", 10, 80);
    doc.setFontSize(12);
    doc.text(`Adresse : ${bill?.workSite?.addressNumber} ${bill?.workSite?.road} ${bill?.workSite?.postalCode} ${bill?.workSite?.city}`, 10, 85);
    doc.text(`Date de début  : ${formatDate(bill.workStartDate)}`, 10, 90);
    doc.text(`Date de fin  : ${formatDate(bill.workEndDate)}`, 10, 95);
    doc.text(`Durée de travaux  : ${bill?.workDuration}`, 10, 100);


    // Services Table
    const servicesData = bill?.services.map(service => [
      `${service.service.label} - ${service.service.type}`,
      service.detailsService,
      `${service.quantity} ${service.unit}`,
      `${service.service.unitPriceHT} €`,
      `${service.vatRate} %`,
      `${service.vatAmount} €`,
      `${service.totalHT} €`,
      `${service.totalTTC} €`,
    ]);
    // Variable pour récupérer la position du dernier tableau
    let lastY = 10;

    doc.autoTable({
      startY: 100,
      head: [["Service", "Description", "Quantité", "Prix Unitaire", "TVA", "Montant TVA", "Prix HT", "Prix TTC"]],
      body: servicesData,
    });

    // Travel costs
    doc.autoTable({
      head: [["Frais de déplacement HT", "Type de forfait", "TVA", "Montant TVA", "Frais TTC"]],
      body: [
        [
          `${bill?.travelCosts} €`,
          "Forfait unique",
          "20%",
          `${vatAmountTravelCost} €`,
          `${priceTTCTravelCost} €`,
        ],
      ],
      didDrawPage: (data) => {
        // `data.cursor.y` donne la position Y du dernier tableau après son rendu
        // Assurez-vous que data.cursor est défini avant d'assigner à lastY
        if (data?.cursor?.y !== undefined) {
          lastY = data.cursor.y;
        }
      },
    });

    // Total bill cost
    doc.autoTable({
      head: [["Total HT", "Montant total TVA", "Total TTC"]],
      body: [
        [`${bill?.totalHt} €`, `${bill?.vatAmount} €`, `${bill?.totalTtc} €`],
      ],
      didDrawPage: (data) => {
        // `data.cursor.y` donne la position Y du dernier tableau après son rendu
        // Assurez-vous que data.cursor est défini avant d'assigner à lastY
        if (data?.cursor?.y !== undefined) {
          lastY = data.cursor.y;
        }
      },
    });

    // Footer (conditions, etc.)
    doc.setFontSize(12);
    doc.text(`Devis créé le : ${formatDate(bill.issueDate)}`, 10, lastY + 20);
    doc.text(`Valable jusqu'au : ${formatDate(bill.dueDate)}`, 10, lastY + 25);
    doc.text(`Accompte demandé : ${bill?.quote.depositAmount} %`, 10, lastY + 30);

    // Download PDF : name of the file
    doc.save(`Devis_${bill?.number}.pdf`);
  };

  return (
    <div>
      <button onClick={generatePDF} className="btn btn-primary">
        Télécharger le devis
      </button>
    </div>
  );
};

export default DownloadBillPDF;

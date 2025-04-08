import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { createDepositBillDraftSchema, createDepositBillFinalSchema } from "@/validation/billValidation";
import { sanitizeData } from "@/lib/sanitize"; 


export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const user = await currentUser();

        if (!data) {
            return NextResponse.json({ success: false, message: "Aucune donnée reçue." }, { status: 400 });
        }

        if (!user) {
            return NextResponse.json({ success: false, message: "Utilisateur non authentifié." }, { status: 401 });
        }

        // const { 
        //     number,
        //     dueDate,
        //     natureOfWork,
        //     description,
        //     // issueDate,
        //     // vatAmount,
        //     // totalTtc,
        //     // totalHt,
        //     workSiteId,
        //     quoteId,
        //     clientId,
        //     services,
        //     status,
        //     workStartDate,
        //     workEndDate,
        //     workDuration,
        //     discountAmount,
        //     discountReason,
        //     travelCosts,
        //     travelCostsType,
        //     paymentTerms
        // } = data;

        // Execute all operations in one transaction for integrity
        const result = await db.$transaction(async (prisma) => {

        // Détecter si la facture est en "brouillon" ou en "final"
        // Exclure 'status' du schéma de validation Zod
        const { status,quoteId, ...dataWithoutStatus } = data;

        // Choisir le schéma en fonction du statut (avant ou après validation)
        const schema = status === "Ready" ? createDepositBillFinalSchema : createDepositBillDraftSchema;
        
        // Validation avec Zod (sans 'status')
        const parsedData = schema.safeParse(dataWithoutStatus);
        if (!parsedData.success) {
            console.error("Validation Zod échouée :", parsedData.error.format());

            return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
        }
        
        // Validation réussie
        // Sanitizing datas
        const sanitizedData = sanitizeData(parsedData.data);
        console.log("Données nettoyées :", JSON.stringify(sanitizedData));
    
        // Ajoute le statut aux données validées
        sanitizedData.status = status;
        sanitizedData.quoteId = quoteId;


            // Generate bill number
            let billNumber = "";

            if (status === "Ready") {
                const currentYear = new Date().getFullYear();
                const counter = await prisma.documentCounter.upsert({
                    where: {
                        year_type: {
                            year: currentYear,
                            type: "deposit"
                        }
                    },
                    update: {
                        current_number: {
                            increment: 1
                        }
                    },
                    create: {
                        year: currentYear,
                        type: "deposit",
                        current_number: currentYear === 2025 ? 3 : 1
                    }
                });
                billNumber = `FAC-AC-${currentYear}-${counter.current_number}`;
            }else {
                // For draft bills, generate a temporary number
                const timestamp = Date.now();
                billNumber = `DRAFT-FAC-AC-${timestamp}`;
            }

            // Count deposit to reduce it later = rest to pay
            // Retrieve quote to count, because totalHT and totalHT of the Bill are possibly note the same than in the quote if there were modifications
            const quote = await prisma.quote.findUnique({
                where: { id: quoteId },
            });

            if (!quote) {
                throw new Error("Devis introuvable");
            }

// Appliquer la remise sur le HT
const htAfterDiscount = Math.max(0, quote.priceHT - (sanitizedData.discountAmount || 0));

// Définir l'acompte HT
const depositHt = Math.max(0, quote.depositAmount ?? 0);

// Calculer la TVA de l'acompte
let depositVat = 0;

for (const service of sanitizedData.services) {
    const serviceTotalHt = Number(service.unitPriceHT) * service.quantity;
    console.log("service totalHt : " + serviceTotalHt + " quote price Ht : " + htAfterDiscount);

    const proportion = Number(serviceTotalHt) / Number(htAfterDiscount);
    console.log("proportion : " + proportion);

    const serviceDepositHt = depositHt * proportion; 
    console.log("serviceDepositHt : " + serviceDepositHt);

    const serviceVat = (Number(serviceDepositHt) * (Number(service.vatRate) / 100)); // 🔹 Arrondi
    console.log("serviceVat : " + serviceVat);

    depositVat += Number(serviceVat);
}

depositVat = Number(depositVat.toFixed(2)); // 🔹 Arrondi

console.log("depositVAT : " + depositVat);

// Montant TTC de l'acompte
const depositTtc = (depositHt + depositVat).toFixed(2);

// Création de la facture d'acompte
const bill = await prisma.bill.create({
    data: {
        number: billNumber,
        issueDate: new Date().toISOString(),
        billType: "DEPOSIT",
        dueDate: sanitizedData.dueDate ? new Date(sanitizedData.dueDate).toISOString() : new Date().toISOString(),
        workStartDate: sanitizedData.workStartDate ? new Date(sanitizedData.workStartDate).toISOString() : null,
        workEndDate: sanitizedData.workEndDate ? new Date(sanitizedData.workEndDate).toISOString() : null,
        workDuration: sanitizedData.workDuration ? sanitizedData.workDuration : null,
        natureOfWork: sanitizedData.natureOfWork,
        description: sanitizedData.description,
        paymentTerms: sanitizedData.paymentTerms ,
        status,
        discountAmount: sanitizedData.discountAmount || 0,
        travelCosts: sanitizedData.travelCosts,
        travelCostsType : sanitizedData.travelCostsType,
        discountReason: sanitizedData.discountReason,
        vatAmount: depositVat,
        totalTtc: Number(depositTtc),
        totalHt: Number((depositHt).toFixed(2)),
        userId: user.id,
        client: { connect: { id: sanitizedData.clientId } },
        workSite: { connect: { id: sanitizedData.workSiteId } },
        quote: { connect: { id: quoteId } }
    }
});

for (const service of sanitizedData.services) {
    const serviceTotalHt = Number(service.unitPriceHT) * service.quantity;
    // Avoid division by 0
    const proportion = htAfterDiscount > 0 ? serviceTotalHt / htAfterDiscount : 0;
    const totalServiceHt = Number(Number(service.unitPriceHT) * service.quantity);

    const serviceDepositHt = Number(depositHt * proportion); 
    const serviceVat = Number(serviceDepositHt * (Number(service.vatRate) / 100));
    const serviceDepositTtc = Number(serviceDepositHt + serviceVat);

    console.log({ serviceDepositHt, serviceVat, serviceDepositTtc }); // Debugging

    // Vérifie si une valeur est NaN avant de l'insérer dans la DB
    if (isNaN(serviceDepositHt) || isNaN(serviceVat) || isNaN(serviceDepositTtc)) {
        throw new Error("Valeurs invalides détectées dans billService.create()");
    }

    const quoteService = await prisma.quoteService.findUnique({
        where: { id: service.id }, 
        select: { serviceId: true }
    });

    if (!quoteService || !quoteService.serviceId) {
        throw new Error(`Aucun service trouvé pour le quoteService ID: ${service.id}`);
    }

    const realServiceId = quoteService.serviceId 


    await prisma.billService.create({
        data: {
            vatRate: service.vatRate,
            unit: service.unit,
            quantity: service.quantity,
            totalHT: totalServiceHt, 
            vatAmount: Number((serviceVat).toFixed(2)),
            totalTTC: Number((serviceDepositTtc).toFixed(2)),
            detailsService: service.detailsService,
            bill: { connect: { id: bill.id } },
            service: { connect: { id: realServiceId } }
        }
    });
}



    return bill;
});


        return NextResponse.json({ success: true, data: result });

    } catch (error) {
        console.error("Erreur détaillée :", error instanceof Error ? error.message : error);
        return NextResponse.json({ success: false, error }, { status: 500 });
    }
}
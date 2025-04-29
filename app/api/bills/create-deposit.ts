import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { createDepositBillDraftSchema, createDepositBillFinalSchema } from "@/validation/billValidation";
import { sanitizeData } from "@/lib/sanitize"; 
import { BillStatusEnum, BillTypeEnum } from "@prisma/client";
import { generateSlug } from "@/lib/utils";


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
        const schema = status === BillStatusEnum.READY ? createDepositBillFinalSchema : createDepositBillDraftSchema;
        
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

        const clientId = sanitizedData.clientId
        const client = await prisma.client.findUnique({
            where: {id: clientId},
        })

        const workSiteId = sanitizedData.workSiteId
        const workSite = await prisma.workSite.findUnique({
            where: {id: workSiteId},
        })
  


            // Generate bill number
            let billNumber = "";

            if (status === BillStatusEnum.READY) {
                const currentYear = new Date().getFullYear();
                const counter = await prisma.documentCounter.upsert({
                    where: {
                        year_type: {
                            year: currentYear,
                            type: BillTypeEnum.DEPOSIT
                        }
                    },
                    update: {
                        current_number: {
                            increment: 1
                        }
                    },
                    create: {
                        year: currentYear,
                        type: BillTypeEnum.DEPOSIT,
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
// const htAfterDiscount = Math.max(0, quote.priceHT - (sanitizedData.discountAmount || 0));
// We keep brut HT without duscount
const htWithoutDiscount = quote.priceHT; 


// Définir l'acompte HT
const depositHt = Math.max(0, quote.depositAmount ?? 0);

// Calculer la TVA de l'acompte
let depositVat = 0;

for (const service of sanitizedData.services) {
    const serviceTotalHt = Number(service.unitPriceHT) * service.quantity;
    console.log("service totalHt : " + serviceTotalHt + " quote price Ht : " + htWithoutDiscount);

    const proportion = Number(serviceTotalHt) / Number(htWithoutDiscount);
    console.log("proportion : " + proportion);

    const serviceDepositHt = depositHt * proportion; 
    console.log("serviceDepositHt : " + serviceDepositHt);

    const serviceVat = (Number(serviceDepositHt) * (Number(service.vatRate) / 100)); // 🔹 Arrondi
    console.log("serviceVat : " + serviceVat);

    depositVat += Number(serviceVat);
}

// 1. Récupération des frais de déplacement
const travelCosts = sanitizedData.travelCosts ?? 0;  // Récupérer les frais de déplacement (HT)

// Calcul de la TVA sur les frais de déplacement
const travelCostsVat = travelCosts * 0.20 ;  
depositVat = depositVat + travelCostsVat; 

depositVat = Number(depositVat.toFixed(2) ); // Arrondi

console.log("depositVAT : " + depositVat);

// Montant TTC de l'acompte
const depositTtc = (depositHt + depositVat).toFixed(2);
const slug = generateSlug("acompte");

// Création de la facture d'acompte
const bill = await prisma.bill.create({
    data: {
        number: billNumber,
        issueDate: new Date().toISOString(),
        billType: BillTypeEnum.DEPOSIT,
        dueDate: sanitizedData.dueDate ? new Date(sanitizedData.dueDate).toISOString() : new Date().toISOString(),
        workStartDate: sanitizedData.workStartDate ? new Date(sanitizedData.workStartDate).toISOString() : null,
        workEndDate: sanitizedData.workEndDate ? new Date(sanitizedData.workEndDate).toISOString() : null,
        workDuration: sanitizedData.workDuration ? sanitizedData.workDuration : null,
        natureOfWork: sanitizedData.natureOfWork,
        description: sanitizedData.description,
        paymentTerms: sanitizedData.paymentTerms ,
        status,
        slug: slug,
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
        quote: { connect: { id: quoteId } },
        // Add backup fields only for FINAL bills
        ...(status === BillStatusEnum.READY && {
            clientBackup: {
                firstName: client?.firstName,
                name: client?.name,
                mail: client?.mail,
                road: client?.road,
                addressNumber: client?.addressNumber,
                city: client?.city,
                postalCode: client?.postalCode,
                additionalAddress: client?.additionalAddress,
            },
            workSiteBackup: {
                road: workSite?.road,
                addressNumber: workSite?.addressNumber,
                city: workSite?.city,
                postalCode: workSite?.postalCode,
                additionalAddress: workSite?.additionalAddress,
            },
            elementsBackup: {
                vatAmount: depositVat,
                totalTtc: Number(depositTtc),
                totalHt: Number((depositHt).toFixed(2)),
                quoteNumber: quote.number
            },
            servicesBackup: JSON.stringify(sanitizedData.services)
        }),
    }
});

      // stock datas for backup for quoteServices
      const billServicesWithData = [];

for (const service of sanitizedData.services) {
    const serviceTotalHt = Number(service.unitPriceHT) * service.quantity;
    // Avoid division by 0
    const proportion = htWithoutDiscount  > 0 ? serviceTotalHt / htWithoutDiscount  : 0;
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


    const billService = await prisma.billService.create({
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
        },
        include: {
          // essential to access service object for backup
          service: true 
      }
    });
              // we add services to the backup's datas
              billServicesWithData.push({
                // datas of the associated service
                label: billService.service.label,
                unitPriceHT: billService.service.unitPriceHT,
                type: billService.service.type,
                // datas of billService
                quantity: billService.quantity,
                unit: billService.unit,
                vatRate: billService.vatRate,
                totalHT: billService.totalHT,
                vatAmount: billService.vatAmount,
                totalTTC: billService.totalTTC,
                detailsService: billService.detailsService || '',
              }); 
}

// 3. Mise à jour de la facture avec les services de sauvegarde
    // Ceci peut être utile si tu veux mettre à jour la facture après que tous les services ont été ajoutés
    await prisma.bill.update({
        where: {
            id: bill.id, // Identifiant de la facture
        },
        data: {
            servicesBackup: billServicesWithData, // Sauvegarde des services après traitement
        }
    });

    return bill;
});


        return NextResponse.json(result);

    } catch (error) {
        console.error("Erreur détaillée :", error instanceof Error ? error.message : error);
        return NextResponse.json({ success: false, error }, { status: 500 });
    }
}
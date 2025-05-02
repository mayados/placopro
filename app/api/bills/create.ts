import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { createBillDraftSchema, createBillFinalSchema } from "@/validation/billValidation";
import { sanitizeData } from "@/lib/sanitize"; 
import { BillStatusEnum, BillTypeEnum } from "@prisma/client";
import { generateSlug } from "@/lib/utils";


export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        // Explicit validation of CSRF token (in addition of the middleware)
        // const csrfToken = req.headers.get("x-csrf-token");
        // if (!csrfToken || csrfToken !== process.env.CSRF_SECRET) {
        //     return new Response("Invalid CSRF token", { status: 403 });
        // }
        console.log("Données reçues dans l'API :", JSON.stringify(data));
        const user = await currentUser();

        if (!data) {
            return NextResponse.json({ success: false, message: "Aucune donnée reçue." }, { status: 400 });
        }

        if (!user) {
            return NextResponse.json({ success: false, message: "Utilisateur non authentifié." }, { status: 401 });
        }

        // const { 
        //     // number,
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
        //     servicesToUnlink,
        //     servicesAdded,
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

        // Détecter si la facture est en "brouillon" ou en "final"
        // Exclure 'status' du schéma de validation Zod
        const { status, ...dataWithoutStatus } = data;

        // Choisir le schéma en fonction du statut (avant ou après validation)
        const schema = status === BillStatusEnum.READY ? createBillFinalSchema : createBillDraftSchema;
        
        // Validation avec Zod (sans 'status')
        const parsedData = schema.safeParse(dataWithoutStatus);
        if (!parsedData.success) {
            console.error("Validation Zod échouée :", parsedData.error.format());

            return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
        }
        
        // Validation réussie, traiter les données avec le statut
        // Sanitizing datas
        const sanitizedData = sanitizeData(parsedData.data);
        console.log("Données nettoyées :", JSON.stringify(sanitizedData));
    
        // Ajoute le statut aux données validées
        sanitizedData.status = status;
        const clientId = data.clientId;

        // Execute all operations in one transaction for integrity
        const result = await db.$transaction(async (prisma) => {
            const billServicesWithData = [];
            // Generate bill number
            let billNumber = "";

            if (status === BillStatusEnum.READY) {
                const currentYear = new Date().getFullYear();
                const counter = await prisma.documentCounter.upsert({
                    where: {
                        year_type: {
                            year: currentYear,
                            type: "bill"
                        }
                    },
                    update: {
                        current_number: {
                            increment: 1
                        }
                    },
                    create: {
                        year: currentYear,
                        type: "bill",
                        current_number: currentYear === 2025 ? 3 : 1
                    }
                });
                billNumber = `FAC-${currentYear}-${counter.current_number}`;
            } else {
                // For draft bills, generate a temporary number
                const timestamp = Date.now();
                billNumber = `DRAFT-FAC-${timestamp}`;
            }

            // Retrieve the quote
            const quote = await prisma.quote.findUnique({
                where: { id: data.quoteId },
            });

            if (!quote) {
                throw new Error("Devis introuvable");
            }

            // Retrieve all deposit bills linked to this quote
            const depositBills = await prisma.bill.findMany({
                where: { quoteId: quote.id, billType: "DEPOSIT" },
            });

            // Calculate total deposits paid with proper rounding
            const totalPaidDepositTTC = parseFloat(depositBills.reduce((acc, bill) => acc + bill.totalTtc, 0).toFixed(2));
            const totalPaidDepositHT = parseFloat(depositBills.reduce((acc, bill) => acc + bill.totalHt, 0).toFixed(2));
            const totalPaidDepositVAT = parseFloat(depositBills.reduce((acc, bill) => acc + bill.vatAmount, 0).toFixed(2));
            const slug = generateSlug("fac");

            // Create initial bill with temporary values
            const bill = await prisma.bill.create({
                data: {
                    number: billNumber,
                    slug: slug,
                    issueDate: new Date().toISOString(),
                    billType: BillTypeEnum.FINAL,
                    dueDate: sanitizedData.dueDate ? new Date(sanitizedData.dueDate).toISOString() : null,
                    workStartDate: sanitizedData.workStartDate ? new Date(sanitizedData.workStartDate).toISOString() : null,
                    workEndDate: sanitizedData.workEndDate ? new Date(sanitizedData.workEndDate).toISOString() : null,
                    workDuration: sanitizedData.workDuration || 0,
                    natureOfWork : sanitizedData.natureOfWork,
                    description: sanitizedData.description,
                    paymentTerms: sanitizedData.paymentTerms,
                    status: status,
                    discountAmount: sanitizedData.discountAmount || 0,
                    travelCosts: sanitizedData.travelCosts || 0,
                    travelCostsType: sanitizedData.travelCostsType,
                    discountReason: sanitizedData.discountReason,
                    vatAmount: 0, // Will be calculated later
                    totalTtc: 0,  // Will be calculated later
                    totalHt: 0,   // Will be calculated later
                    author: user.id,
                    client: { connect: { id: data.clientId } },
                    workSite: { connect: { id: data.workSiteId } },
                    ...(data.quoteId && { quote: { connect: { id: data.quoteId } } })
                },
            });

            // Initialize totals
            let billTotalHT = 0;
            let billTotalVAT = 0;
            let billTotalTTC = 0;

            // Calculate travel costs
            const travelCostsHT = parseFloat(data.travelCosts) || 0;
            const travelCostsVatRate = 20; // Default VAT rate for travel costs
            const travelCostsVAT = parseFloat((travelCostsHT * (travelCostsVatRate / 100)).toFixed(2));
            const travelCostsTTC = parseFloat((travelCostsHT + travelCostsVAT).toFixed(2));

            // Add travel costs to totals
            billTotalHT += travelCostsHT;
            billTotalVAT += travelCostsVAT;
            billTotalTTC += travelCostsTTC;

            // Log for debugging
            console.log(`Frais de déplacement: ${travelCostsHT} HT, ${travelCostsVAT} TVA, ${travelCostsTTC} TTC`);
            console.log(`Totaux après frais: ${billTotalHT} HT, ${billTotalVAT} TVA, ${billTotalTTC} TTC`);

            // Process services
            if((sanitizedData.servicesToUnlink ?? []).length === 0 && (sanitizedData.servicesAdded ?? []).length === 0){
            // if (validatedData.servicesToUnlink.length === 0 && data.servicesAdded.length === 0) {
                // Case 1: No modifications - process all services as they are
                console.log("Aucune modification, création des billServices à partir des quoteServices");

                for (const service of sanitizedData.services) {
                    // Find the original quoteService
                    const quoteService = await prisma.quoteService.findUnique({
                        where: { id: service.id },
                        include: {
                            service: true
                        }
                    });

                    if (!quoteService) {
                        throw new Error(`QuoteService not found for id: ${service.id}`);
                    }

                    // Get service amounts
                    const totalHTService = Number(quoteService.totalHT);
                    const vatAmountService = Number(quoteService.vatAmount);
                    const totalTTCService = Number(quoteService.totalTTC);

                    // Add to bill totals
                    billTotalHT += totalHTService;
                    billTotalVAT += vatAmountService;
                    billTotalTTC += totalTTCService;

                    // Log for debugging
                    console.log(`Service ${quoteService.service.label}: ${totalHTService} HT, ${vatAmountService} TVA, ${totalTTCService} TTC`);
                    console.log(`Totaux après service: ${billTotalHT} HT, ${billTotalVAT} TVA, ${billTotalTTC} TTC`);

                    // Create billService
                    const billServiceCreated = await prisma.billService.create({
                        data: {
                            vatRate: service.vatRate,
                            unit: service.unit,
                            quantity: Number(service.quantity),
                            totalHT: totalHTService,
                            vatAmount: vatAmountService,
                            totalTTC: totalTTCService,
                            detailsService: service.detailsService,
                            bill: {
                                connect: { id: bill.id }
                            },
                            service: {
                                connect: { id: quoteService.serviceId }
                            }, 
                            
                        },
                        include: {
                            // essential to access service object for backup
                            service: true 
                        }
                    });
                    // we add services to the backup's datas
                    billServicesWithData.push({
                        // Données du service associé
                        label: billServiceCreated.service.label,
                        unitPriceHT: billServiceCreated.service.unitPriceHT,
                        type: billServiceCreated.service.type,
                        // Données du billService lui-même
                        quantity: billServiceCreated.quantity,
                        unit: billServiceCreated.unit,
                        vatRate: billServiceCreated.vatRate,
                        totalHT: billServiceCreated.totalHT,
                        vatAmount: billServiceCreated.vatAmount,
                        totalTTC: billServiceCreated.totalTTC,
                        detailsService: billServiceCreated.detailsService || null,
                        discountAmount: billServiceCreated.discountAmount || 0,
                        discountReason: billServiceCreated.discountReason || null
                    });
                }
            } else {
                // Case 2: Services have been modified
                console.log("Modifications détectées, recalcul des montants");

                for (const service of sanitizedData.services) {
                    // Skip services that are marked to be unlinked
                    if (data.servicesToUnlink.some((s: ServiceFormQuoteType) => s.id === service.id)) {
                        console.log(`Service ${service.label || service.id} ignoré car marqué pour suppression`);
                        continue;
                    }

                    // Calculate service amounts
                    const totalHTService = parseFloat((parseFloat(service.unitPriceHT) * service.quantity).toFixed(2));
                    const vatRateService = parseFloat(service.vatRate);
                    const vatAmountService = parseFloat((totalHTService * (vatRateService / 100)).toFixed(2));
                    const totalTTCService = parseFloat((totalHTService + vatAmountService).toFixed(2));

                    // Add to bill totals
                    billTotalHT += totalHTService;
                    billTotalVAT += vatAmountService;
                    billTotalTTC += totalTTCService;

                    // Log for debugging
                    console.log(`Service ${service.label || service.id}: ${totalHTService} HT, ${vatAmountService} TVA, ${totalTTCService} TTC`);
                    console.log(`Totaux après service: ${billTotalHT} HT, ${billTotalVAT} TVA, ${billTotalTTC} TTC`);

                    // Determine the service ID to use
                    let serviceId = service.id;
                    const existingService = await prisma.service.findUnique({
                        where: { id: service.id }
                    });

                    if (!existingService) {
                        const quoteService = await prisma.quoteService.findUnique({
                            where: { id: service.id },
                            select: { serviceId: true }
                        });

                        if (quoteService) {
                            serviceId = quoteService.serviceId;
                        } else {
                            // Create a new service if it doesn't exist
                            const newService = await prisma.service.create({
                                data: {
                                    label: service.label,
                                    unitPriceHT: parseFloat(service.unitPriceHT),
                                    type: service.type,
                                    units: {
                                        create: {
                                            unit: {
                                                connectOrCreate: {
                                                    where: { label: service.unit },
                                                    create: { label: service.unit }
                                                }
                                            }
                                        }
                                    },
                                    vatRates: {
                                        create: {
                                            vatRate: {
                                                connectOrCreate: {
                                                    where: { rate: parseFloat(service.vatRate) },
                                                    create: { rate: parseFloat(service.vatRate) }
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                            serviceId = newService.id;
                        }
                    }

                    // Create billService
                    const billServiceCreated = await prisma.billService.create({
                        data: {
                            vatRate: service.vatRate,
                            unit: service.unit,
                            quantity: Number(service.quantity),
                            totalHT: totalHTService,
                            vatAmount: vatAmountService,
                            totalTTC: totalTTCService,
                            detailsService: service.detailsService,
                            bill: { connect: { id: bill.id } },
                            service: { connect: { id: serviceId } }
                        },
                        include: {
                            // essential to access service object for backup
                            service: true 
                        }
                    });

                    // we add services to the backup's datas
                    billServicesWithData.push({
                        // datas of the associated service
                        label: billServiceCreated.service.label,
                        unitPriceHT: billServiceCreated.service.unitPriceHT,
                        type: billServiceCreated.service.type,
                        // datas of billService
                        quantity: billServiceCreated.quantity,
                        unit: billServiceCreated.unit,
                        vatRate: billServiceCreated.vatRate,
                        totalHT: billServiceCreated.totalHT,
                        vatAmount: billServiceCreated.vatAmount,
                        totalTTC: billServiceCreated.totalTTC,
                        detailsService: billServiceCreated.detailsService || null,
                        discountAmount: billServiceCreated.discountAmount || 0,
                        discountReason: billServiceCreated.discountReason || null
                    });
                }
            }

            // Log totals before discount and deposits
            console.log(`Totaux bruts: ${billTotalHT} HT, ${billTotalVAT} TVA, ${billTotalTTC} TTC`);
            console.log(`Remise: ${sanitizedData.discountAmount || 0}`);
            console.log(`Acomptes: ${totalPaidDepositHT} HT, ${totalPaidDepositVAT} TVA, ${totalPaidDepositTTC} TTC`);

            // Apply discount to HT amount
            const discountAmountValue = parseFloat(data.discountAmount) || 0;
            const htAfterDiscount = parseFloat((billTotalHT - discountAmountValue).toFixed(2));
            
            // Recalculate TTC after discount (VAT stays the same)
            const ttcAfterDiscount = parseFloat((htAfterDiscount + billTotalVAT).toFixed(2));
            
            // Log after discount
            console.log(`Après remise: ${htAfterDiscount} HT, ${billTotalVAT} TVA, ${ttcAfterDiscount} TTC`);
            
            // Subtract deposits (only if there are any)
            let finalHT = htAfterDiscount;
            // Recalcul de la TVA sans soustraction de la TVA de l'acompte
            let finalVAT = billTotalVAT;
            let finalTTC = ttcAfterDiscount;
            
            if (totalPaidDepositTTC > 0) {
                finalHT = parseFloat((htAfterDiscount - totalPaidDepositHT).toFixed(2));
                // finalVAT = parseFloat((billTotalVAT - totalPaidDepositVAT).toFixed(2));
                finalTTC = parseFloat((ttcAfterDiscount - totalPaidDepositTTC).toFixed(2));
                
                // Log after deposits
                console.log(`Après acomptes: ${finalHT} HT, ${finalVAT} TVA, ${finalTTC} TTC`);
            }
            
            // Ensure non-negative values
            finalHT = Math.max(0, finalHT);
            finalVAT = Math.max(0, finalVAT);
            finalTTC = Math.max(0, finalTTC);
            
            // Log final values
            console.log(`Valeurs finales: ${finalHT} HT, ${finalVAT} TVA, ${finalTTC} TTC`);
            
            const client = await prisma.client.findUnique({
                where: {id: clientId},
            })

            

            // Update bill with final amounts
            await prisma.bill.update({
                where: { id: bill.id },
                data: {
                    totalHt: finalHT,
                    vatAmount: finalVAT,
                    totalTtc: finalTTC,
                    depositDeductionAmount: totalPaidDepositTTC > 0 ? totalPaidDepositTTC : 0,
                    remainingDueAmount: finalTTC,
                    ...(totalPaidDepositTTC > 0 && {
                        advancePayments: {
                            connect: depositBills.map(deposit => ({ id: deposit.id }))
                        }
                    }),
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
                        servicesBackup: billServicesWithData,
                        elementsBackup: {
                            quote: quote.number,
                            totalHt: finalHT,
                            vatAmount: finalVAT,
                            totalTtc: finalTTC,
                            depositDeductionAmount: totalPaidDepositTTC > 0 ? totalPaidDepositTTC : 0,
                            remainingDueAmount: finalTTC,
                        },
                    }),
                },
            });

            return await prisma.bill.findUnique({
                where: { id: bill.id },
                include: {
                    services: true
                }
            });
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("Erreur détaillée :", error instanceof Error ? error.message : error);
        return NextResponse.json({ success: false, error }, { status: 500 });
    }
}
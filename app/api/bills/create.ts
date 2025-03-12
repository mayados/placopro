import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'

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

        const { 
            number,
            dueDate,
            natureOfWork,
            description,
            issueDate,
            vatAmount,
            totalTtc,
            totalHt,
            workSiteId,
            quoteId,
            clientId,
            services,
            servicesToUnlink,
            servicesAdded,
            status,
            workStartDate,
            workEndDate,
            workDuration,
            discountAmount,
            discountReason,
            travelCosts,
            travelCostsType,
            paymentTerms
        } = data;

        // Execute all operations in one transaction for integrity
        const result = await db.$transaction(async (prisma) => {
            // Generate bill number
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
            const billNumber = `FAC-${currentYear}-${counter.current_number}`;

            // Count deposit to reduce it later = rest to pay
            // Retrieve quote to count, because totalHT and totalHT of the Bill are possibly note the same than in the quote if there were modifications
            const quote = await prisma.quote.findUnique({
                where: { id: quoteId },
            });

            if (!quote) {
                throw new Error("Devis introuvable");
            }

            // Retrieve all deposit bills linked to this quote
            const depositBills = await prisma.bill.findMany({
                where: { quoteId: quote.id, billType: "DEPOSIT" },
            });

            // // Count deposit already paid
            // const totalPaidDeposit = depositBills.reduce((acc, bill) => acc + bill.totalTtc, 0);


            // Calculer les totaux des acomptes avec arrondi à 2 décimales
            const totalPaidDepositTTC = parseFloat(depositBills.reduce((acc, bill) => acc + bill.totalTtc, 0).toFixed(2));
            const totalPaidDepositHT = parseFloat(depositBills.reduce((acc, bill) => acc + bill.totalHt, 0).toFixed(2));
            const totalPaidDepositVAT = parseFloat(depositBills.reduce((acc, bill) => acc + bill.vatAmount, 0).toFixed(2));

            // Appliquer la remise sur le montant HT avec arrondi
            const htAfterDiscount = parseFloat((totalHt - discountAmount).toFixed(2));

            // Calculer le nouveau montant TTC après remise
            const ttcAfterDiscount = parseFloat((htAfterDiscount + vatAmount).toFixed(2));

            // Calculer les montants restants à payer avec arrondi
            const remainingAmountTTC = parseFloat((ttcAfterDiscount - totalPaidDepositTTC).toFixed(2));
            const remainingAmountHT = parseFloat((htAfterDiscount - totalPaidDepositHT).toFixed(2));
            const remainingVatAmount = parseFloat((vatAmount - totalPaidDepositVAT).toFixed(2));


            // Bill creation
            const bill = await prisma.bill.create({
                data: {
                    number: billNumber,
                    issueDate: new Date().toISOString(),
                    billType: "INVOICE",
                    dueDate: dueDate ? new Date(dueDate).toISOString() : null,
                    workStartDate: workStartDate ? new Date(dueDate).toISOString() : null,
                    workEndDate: workEndDate ? new Date(dueDate).toISOString() : null,
                    workDuration: parseInt(workDuration),
                    natureOfWork,
                    description,
                    paymentTerms,
                    status,
                    discountAmount: parseFloat(discountAmount) || 0,
                    travelCosts,
                    travelCostsType,
                    discountReason,
                    vatAmount: parseFloat(vatAmount) || 0,
                    totalTtc: Number(remainingAmountTTC) || 0,
                    totalHt: Number(remainingAmountHT) || 0,
                    userId: user.id,
                    client: { connect: { id: clientId } },
                    workSite: { connect: { id: workSiteId } },
                    ...(quoteId && { quote: { connect: { id: quoteId } } })
                },
            });


            // The case where everything is identitcal to the Quote
            if (servicesToUnlink.length === 0 && servicesAdded.length === 0) {
                console.log("aucune modif, je crée tous les billServices");

                // Case 1: No modification - treat all services
                for (const service of services) {
                    // I create the billService thanks to the quoteService which it comes from
                    const quoteService = await prisma.quoteService.findUnique({
                        where: { id: service.id },
                        include: {
                            service: true
                        }
                    });

                    if (!quoteService) {
                        throw new Error(`QuoteService not found for id: ${service.id}`);
                    }

                    // Calculer les montants à partir des données du quoteService
                    const totalHTService = Number(quoteService.totalHT);
                    const vatAmountService = Number(quoteService.vatAmount);
                    const totalTTCService = Number(quoteService.totalTTC)


                    await prisma.billService.create({
                        data: {
                            vatRate: service.vatRate,
                            unit: service.unit,
                            quantity: Number(service.quantity),
                            totalHT: Number(totalHTService),
                            vatAmount: Number(vatAmountService),
                            totalTTC: Number(totalTTCService),
                            detailsService: service.detailsService,
                            bill: {
                                connect: { id: bill.id }
                            },
                            service: {
                                connect: { id: quoteService.serviceId }
                            }
                        },
                    });
                }
            } else {
                // Case 2 : There are modifications
                let newTotalHt = parseFloat(totalHt) || 0;
                let newTotalTtc = parseFloat(totalTtc) || 0;
                let newVatAmount = parseFloat(vatAmount) || 0;

                for (const service of services) {
                    const totalHTService = parseFloat(service.unitPriceHT) * parseFloat(service.quantity);
                    const vatRateService = parseFloat(service.vatRate);
                    const vatAmountService = totalHTService * (vatRateService/100);
                    const totalTTCService = totalHTService + vatAmountService;

                    if (servicesToUnlink.some((s: ServiceFormBillType) => s.id === service.id)) {
                        newTotalHt -= totalHTService;
                        newTotalTtc -= totalTTCService;
                        newVatAmount -= vatAmountService;
                        continue;
                    }

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
                            const newService = await prisma.service.create({
                                data: {
                                    label: service.label,
                                    unitPriceHT: parseFloat(service.unitPriceHT.toString()),
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

                    newTotalHt += totalHTService;
                    newTotalTtc += totalTTCService;
                    newVatAmount += vatAmountService;  
                    
                    // newTotalTtc = newTotalTtc - totalPaidDeposit;
                    // newTotalHt = newTotalHt - (totalPaidDeposit * (newTotalHt / newTotalTtc)) - discountAmount;

                    // D'abord appliquer la remise sur le HT
                    const htAfterDiscount = parseFloat((newTotalHt - discountAmount).toFixed(2));

                    // Recalculer le TTC après remise
                    const ttcAfterDiscount = htAfterDiscount + newVatAmount 
                    ;

                    // Ensuite soustraire les acomptes
                    newTotalTtc = ttcAfterDiscount - totalPaidDepositTTC;
                    newTotalHt = htAfterDiscount - totalPaidDepositHT;
                    newVatAmount = newTotalTtc - newTotalHt;

                    await prisma.bill.update({
                      where: { id: bill.id },
                      data: {
                          totalHt: Math.max(0, newTotalHt),
                          vatAmount: Math.max(0, newVatAmount),
                          totalTtc: Math.max(0, newTotalTtc)
                      },
                    });



                    await prisma.billService.create({
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
                        }
                    });
                }

                if (servicesToUnlink.length > 0) {
                             
                    newTotalTtc = newTotalTtc - totalPaidDepositTTC;
                    newTotalHt = newTotalHt - totalPaidDepositHT - discountAmount;

                    await prisma.bill.update({
                        where: { id: bill.id },
                        data: {
                            totalHt: Math.max(0, newTotalHt),
                            vatAmount: Math.max(0, newVatAmount),
                            totalTtc: Math.max(0, newTotalTtc)
                        },
                    });
                }
            }

            return bill;
        });

        return NextResponse.json({ success: true, data: result });

    } catch (error) {
        console.error("Erreur détaillée :", error instanceof Error ? error.message : error);
        return NextResponse.json({ success: false, error }, { status: 500 });
    }
}
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server';
import { updateDraftBillSchema, updateDraftFinalBillSchema } from "@/validation/billValidation";
import { sanitizeData } from "@/lib/sanitize"; 
import { BillStatusEnum, BillTypeEnum } from "@prisma/client";


export async function PUT(req: NextRequest) {
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
        //     id, 
        //     // number,
        //     dueDate,
        //     natureOfWork,
        //     description,
        //     // issueDate,
        //     // vatAmount,
        //     // totalTtc,
        //     // totalHt,
        //     // workSiteId,
        //     quoteId,
        //     // clientId,
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
        //     paymentTerms,
        //     paymentDate,
        //     paymentMethod,
        //     // isCanceled,
        //     // cancelReason
        // } = data;

        // Détecter si la facture est enregistrée en tant que "brouillon" ou en "final"
        // Exclure 'status' du schéma de validation Zod
        const { status, billId, ...dataWithoutStatus } = data;
        console.log("Bill ID extrait:", billId); // Vérifie s'il est bien défini

        // Choisir le schéma en fonction du statut (avant ou après validation)
        const schema = status === BillStatusEnum.READY ? updateDraftFinalBillSchema : updateDraftBillSchema;
        
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
        sanitizedData.billId = billId;

        // Verify if bill exists
        const existingBill = await db.bill.findUnique({
            where: { id: billId },
            include: {
                services: true,
                quote: true
            }
        });

        if (!existingBill) {
            return NextResponse.json({ success: false, message: "Bill not found." }, { status: 404 });
        }

        // Execute all operations in one transaction for integrity
        const result = await db.$transaction(async (prisma) => {
            // Retrieve deposits linked to the quote
            let totalPaidDepositTTC = 0;
            let totalPaidDepositHT = 0;
            let totalPaidDepositVAT = 0;

            if (sanitizedData.quoteId) {
                const depositBills = await prisma.bill.findMany({
                    where: { 
                        quoteId: sanitizedData.quoteId, 
                        billType: BillTypeEnum.DEPOSIT,
                        // Exclude this Bill
                        id: { not: billId }
                    },
                });

                // Count of deposits
                totalPaidDepositTTC = parseFloat(depositBills.reduce((acc, bill) => acc + bill.totalTtc, 0).toFixed(2));
                totalPaidDepositHT = parseFloat(depositBills.reduce((acc, bill) => acc + bill.totalHt, 0).toFixed(2));
                totalPaidDepositVAT = parseFloat(depositBills.reduce((acc, bill) => acc + bill.vatAmount, 0).toFixed(2));
            }

            // Generate a unique number when status changes from draft to ready
            let billNumber = existingBill.number;
            if (status === BillStatusEnum.READY && existingBill.status === BillStatusEnum.DRAFT) {
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
            }

            // Update base's informations of the bill
            const baseUpdateData = {
                number: billNumber,
                dueDate: sanitizedData.dueDate ? new Date(sanitizedData.dueDate) : existingBill.dueDate,
                workStartDate: sanitizedData.workStartDate ? new Date(sanitizedData.workStartDate) : existingBill.workStartDate,
                workEndDate: sanitizedData.workEndDate ? new Date(sanitizedData.workEndDate) : existingBill.workEndDate,
                workDuration: sanitizedData.workDuration !== undefined ? sanitizedData.workDuration : existingBill.workDuration,
                natureOfWork: sanitizedData.natureOfWork || existingBill.natureOfWork,
                description: sanitizedData.description || existingBill.description,
                paymentTerms: sanitizedData.paymentTerms || existingBill.paymentTerms,
                status: status || existingBill.status,
                discountAmount: sanitizedData.discountAmount !== undefined ? sanitizedData.discountAmount : existingBill.discountAmount,
                discountReason: sanitizedData.discountReason !== undefined ? sanitizedData.discountReason : existingBill.discountReason,
                travelCosts: sanitizedData.travelCosts !== undefined ? sanitizedData.travelCosts : existingBill.travelCosts,
                travelCostsType: sanitizedData.travelCostsType || existingBill.travelCostsType,
                // canceledAt: isCanceled ? new Date() : existingBill.canceledAt,
            };

            // Delete services which are unliked
            if (sanitizedData.servicesToUnlink && sanitizedData.servicesToUnlink.length > 0) {
                for (const serviceToUnlink of sanitizedData.servicesToUnlink) {
                    await prisma.billService.delete({
                        where: { id: serviceToUnlink.id }
                    });
                }
            }

            // Count new totals in function of services
            let newTotalHt = 0;
            let newVatAmount = 0;
            let newTotalTtc = 0;

            // Update existing services and add new services
            if (sanitizedData.services && sanitizedData.services.length > 0) {
                for (const service of sanitizedData.services) {
                    const totalHTService = parseFloat(service.unitPriceHT) * service.quantity;
                    const vatRateService = parseFloat(service.vatRate);
                    const vatAmountService = totalHTService * (vatRateService / 100);
                    const totalTTCService = totalHTService + vatAmountService;

                    newTotalHt += totalHTService;
                    newVatAmount += vatAmountService;
                    newTotalTtc += totalTTCService;

                    // If the service has an ID, it's an update
                    if (service.id) {
                        await prisma.billService.update({
                            where: { id: service.id },
                            data: {
                                quantity: service.quantity,
                                totalHT: totalHTService,
                                vatAmount: vatAmountService,
                                totalTTC: totalTTCService,
                                detailsService: service.detailsService,
                                vatRate: service.vatRate,
                                unit: service.unit
                            }
                        });
                    } else {
                        // Else, it's a service to add (create)
                        let serviceId = service.id;

                        if (!serviceId) {
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

                        // Create BillService
                        await prisma.billService.create({
                            data: {
                                vatRate: service.vatRate,
                                unit: service.unit,
                                quantity: service.quantity,
                                totalHT: totalHTService,
                                vatAmount: vatAmountService,
                                totalTTC: totalTTCService,
                                detailsService: service.detailsService,
                                bill: { connect: { id: billId } },
                                service: { connect: { id: serviceId } }
                            }
                        });
                    }
                }
            }

            // Apply discount on HT
            const htAfterDiscount = parseFloat((newTotalHt - (sanitizedData.discountAmount || 0)).toFixed(2));
            
            // Count TTC after discount
            const ttcAfterDiscount = htAfterDiscount + newVatAmount;
            
            // Minus deposits if it's a final bill
            const finalTotalHt = existingBill.billType === BillTypeEnum.FINAL 
                ? Math.max(0, htAfterDiscount - totalPaidDepositHT)
                : htAfterDiscount;
                
            const finalTotalTtc = existingBill.billType === BillTypeEnum.FINAL
                ? Math.max(0, ttcAfterDiscount - totalPaidDepositTTC)
                : ttcAfterDiscount;
                
            const finalVatAmount = finalTotalTtc - finalTotalHt;

            // Update Bill
            const updatedBill = await prisma.bill.update({
                where: { id: billId },
                data: {
                    ...baseUpdateData,
                    totalHt: finalTotalHt,
                    vatAmount: finalVatAmount,
                    totalTtc: finalTotalTtc,
                }
            });

            return {
                success: true,
                bill: updatedBill
            };
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("Erreur détaillée :", error instanceof Error ? error.message : error);
        return NextResponse.json({ 
            success: false, 
            message: "Erreur during bill's update", 
            error: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
    }
}
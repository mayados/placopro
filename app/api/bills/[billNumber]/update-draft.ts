import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server';

export async function PUT(req: NextRequest) {
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
            id, 
            // number,
            dueDate,
            natureOfWork,
            description,
            // issueDate,
            // vatAmount,
            // totalTtc,
            // totalHt,
            // workSiteId,
            quoteId,
            // clientId,
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
            paymentTerms,
            paymentDate,
            paymentMethod,
            // isCanceled,
            // cancelReason
        } = data;

        // Verify if bill exists
        const existingBill = await db.bill.findUnique({
            where: { id },
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

            if (quoteId) {
                const depositBills = await prisma.bill.findMany({
                    where: { 
                        quoteId: quoteId, 
                        billType: "DEPOSIT",
                        // Exclude this Bill
                        id: { not: id }
                    },
                });

                // Count of deposits
                totalPaidDepositTTC = parseFloat(depositBills.reduce((acc, bill) => acc + bill.totalTtc, 0).toFixed(2));
                totalPaidDepositHT = parseFloat(depositBills.reduce((acc, bill) => acc + bill.totalHt, 0).toFixed(2));
                totalPaidDepositVAT = parseFloat(depositBills.reduce((acc, bill) => acc + bill.vatAmount, 0).toFixed(2));
            }

            // Generate a unique number when status changes from draft to ready
            let billNumber = existingBill.number;
            if (status === 'ready' && existingBill.status === 'draft') {
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
                dueDate: dueDate ? new Date(dueDate) : existingBill.dueDate,
                workStartDate: workStartDate ? new Date(workStartDate) : existingBill.workStartDate,
                workEndDate: workEndDate ? new Date(workEndDate) : existingBill.workEndDate,
                workDuration: workDuration !== undefined ? parseInt(workDuration) : existingBill.workDuration,
                natureOfWork: natureOfWork || existingBill.natureOfWork,
                description: description || existingBill.description,
                paymentTerms: paymentTerms || existingBill.paymentTerms,
                status: status || existingBill.status,
                discountAmount: discountAmount !== undefined ? parseFloat(discountAmount) : existingBill.discountAmount,
                discountReason: discountReason !== undefined ? discountReason : existingBill.discountReason,
                travelCosts: travelCosts !== undefined ? parseFloat(travelCosts) : existingBill.travelCosts,
                travelCostsType: travelCostsType || existingBill.travelCostsType,
                paymentDate: paymentDate ? new Date(paymentDate) : existingBill.paymentDate,
                paymentMethod: paymentMethod || existingBill.paymentMethod,
                // canceledAt: isCanceled ? new Date() : existingBill.canceledAt,
            };

            // Delete services which are unliked
            if (servicesToUnlink && servicesToUnlink.length > 0) {
                for (const serviceToUnlink of servicesToUnlink) {
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
            if (services && services.length > 0) {
                for (const service of services) {
                    const totalHTService = parseFloat(service.unitPriceHT) * parseFloat(service.quantity);
                    const vatRateService = parseFloat(service.vatRate);
                    const vatAmountService = totalHTService * (vatRateService / 100);
                    const totalTTCService = totalHTService + vatAmountService;

                    newTotalHt += totalHTService;
                    newVatAmount += vatAmountService;
                    newTotalTtc += totalTTCService;

                    // If the service has an ID, it's an update
                    if (service.billServiceId) {
                        await prisma.billService.update({
                            where: { id: service.billServiceId },
                            data: {
                                quantity: parseFloat(service.quantity),
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
                                quantity: parseFloat(service.quantity),
                                totalHT: totalHTService,
                                vatAmount: vatAmountService,
                                totalTTC: totalTTCService,
                                detailsService: service.detailsService,
                                bill: { connect: { id: id } },
                                service: { connect: { id: serviceId } }
                            }
                        });
                    }
                }
            }

            // Apply discount on HT
            const htAfterDiscount = parseFloat((newTotalHt - (discountAmount || 0)).toFixed(2));
            
            // Count TTC after discount
            const ttcAfterDiscount = htAfterDiscount + newVatAmount;
            
            // Minus deposits if it's a final bill
            const finalTotalHt = existingBill.billType === "INVOICE" 
                ? Math.max(0, htAfterDiscount - totalPaidDepositHT)
                : htAfterDiscount;
                
            const finalTotalTtc = existingBill.billType === "INVOICE"
                ? Math.max(0, ttcAfterDiscount - totalPaidDepositTTC)
                : ttcAfterDiscount;
                
            const finalVatAmount = finalTotalTtc - finalTotalHt;

            // Update Bill
            const updatedBill = await prisma.bill.update({
                where: { id },
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
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
            let billNumber = "";

            if (status === "ready") {
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

    // Apply discount on HT
    const htAfterDiscount = Math.max(0, quote.priceHT - (discountAmount || 0));
    
    // Defin deposit 
    const depositHt = Math.max(0, quote.depositAmount ?? 0);
    
    // Count VAT of deposit (we have to proceed this way because each service can have a different vat)
    let depositVat = 0;
    for (const service of services) {
        const proportion = service.totalHt / quote.priceHT;
        const serviceDepositHt = depositHt * proportion;
        const serviceVat = serviceDepositHt * (service.vatRate / 100);
        depositVat += serviceVat;
    }

    // Deposit TTC amount (because in french legislation, even deposits have vat)
    const depositTtc = depositHt + depositVat;

    // create deposit bill
    const bill = await prisma.bill.create({
        data: {
            number: billNumber,
            issueDate: new Date().toISOString(),
            billType: "DEPOSIT",
            // dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
            workStartDate: workStartDate ? new Date(workStartDate).toISOString() : null,
            workEndDate: workEndDate ? new Date(workEndDate).toISOString() : null,
            workDuration: workDuration ? parseInt(workDuration) : null,
            natureOfWork,
            description,
            paymentTerms,
            status,
            discountAmount: discountAmount || 0,
            travelCosts,
            travelCostsType,
            discountReason,
            vatAmount: depositVat,
            totalTtc: depositTtc,
            totalHt: depositHt,
            userId: user.id,
            client: { connect: { id: clientId } },
            workSite: { connect: { id: workSiteId } },
            quote: { connect: { id: quoteId } }
        }
    });

    // Create a BillService for each service (their amounts correspond to deposit part, because we have to display the details on the bill)
    for (const service of services) {
        const proportion = service.totalHt / quote.priceHT;
        const serviceDepositHt = depositHt * proportion;
        const serviceVat = serviceDepositHt * (service.vatRate / 100);
        const serviceDepositTtc = serviceDepositHt + serviceVat;

        await prisma.billService.create({
            data: {
                vatRate: service.vatRate,
                unit: service.unit,
                quantity: service.quantity,
                totalHT: serviceDepositHt,
                vatAmount: serviceVat,
                totalTTC: serviceDepositTtc,
                detailsService: service.detailsService,
                bill: { connect: { id: bill.id } },
                service: { connect: { id: service.id } }
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
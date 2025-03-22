// Ce qui peut changer : paymentTerms + date limite de paiement

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
            paymentTerms,
            dueDate,
            status
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

        // Préparer l'objet de mise à jour (ignorer les champs absents)
        const updateData: Record<string, string | Date | null> = {};

        if (paymentTerms !== null && paymentTerms !== existingBill.paymentTerms) {
            updateData.paymentTerms = paymentTerms;
        }
        
        if (dueDate !== null && dueDate !== existingBill.paymentDate) {
            updateData.paymentDate = dueDate ? new Date(dueDate) : null;
        }
        
        if (status !== null && status !== existingBill.status) {
            updateData.status = status;
        }

        // Execute all operations in one transaction for integrity
        const result = await db.$transaction(async (prisma) => {


            // Generate a unique number when status changes from draft to ready
            let billNumber = existingBill.number;
            if (status === 'Ready' && existingBill.status === 'draft') {
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
                billNumber = `FAC-AC-${currentYear}-${counter.current_number}`;
            }

            // Vérifier s'il y a des changements à appliquer
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ success: true, message: "No modification recieved" });
        }

        // Mise à jour de la facture
        const updatedBill = await db.bill.update({
            where: { id },
            data: updateData
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
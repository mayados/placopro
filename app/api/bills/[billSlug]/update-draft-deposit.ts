// Ce qui peut changer : paymentTerms + date limite de paiement

import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server';
import { updateDraftBillDepositSchema, updateDraftFinalDepositBillSchema } from "@/validation/billValidation";
import { sanitizeData } from "@/lib/sanitize"; 
import { BillStatusEnum } from "@prisma/client";


export async function PUT(req: NextRequest) {
    try {
        const data = await req.json();
        const user = await currentUser();
        // Explicit validation of CSRF token (in addition of the middleware)
        // const csrfToken = req.headers.get("x-csrf-token");
        // if (!csrfToken || csrfToken !== process.env.CSRF_SECRET) {
        //     return new Response("Invalid CSRF token", { status: 403 });
        // }

        if (!data) {
            return NextResponse.json({ success: false, message: "Aucune donnée reçue." }, { status: 400 });
        }

        if (!user) {
            return NextResponse.json({ success: false, message: "Utilisateur non authentifié." }, { status: 401 });
        }

        // const { 
        //     id, 
        //     paymentTerms,
        //     dueDate,
        //     status
        // } = data;

        // Détecter si la facture est enregistrée en tant que "brouillon" ou en "final"
        // Exclure 'status' du schéma de validation Zod
        const { status, id, ...dataWithoutStatus } = data;
        console.log("Bill ID extrait:", id); // Vérifie s'il est bien défini
        
        // Choisir le schéma en fonction du statut (avant ou après validation)
        const schema = status === BillStatusEnum.READY ? updateDraftFinalDepositBillSchema : updateDraftBillDepositSchema;
                
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
        sanitizedData.id = id;
                

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

        if (sanitizedData.paymentTerms !== null && sanitizedData.paymentTerms !== existingBill.paymentTerms) {
            updateData.paymentTerms = sanitizedData.paymentTerms;
        }
        
        if (sanitizedData.dueDate !== null && sanitizedData.dueDate !== existingBill.paymentDate) {
            updateData.paymentDate = sanitizedData.dueDate ? new Date(sanitizedData.dueDate) : null;
        }
        
        if (status !== null && status !== existingBill.status) {
            updateData.status = status;
        }

        // Execute all operations in one transaction for integrity
        const result = await db.$transaction(async (prisma) => {


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
                billNumber = `FAC-AC-${currentYear}-${counter.current_number}`;
            }

            // Vérifier s'il y a des changements à appliquer
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ success: true, message: "No modification recieved" });
        }

        // Mise à jour de la facture
        const updatedBill = await db.bill.update({
            where: { id },
            data: {
                ...updateData,
                ...(status === BillStatusEnum.READY && existingBill.status === BillStatusEnum.DRAFT
                  ? { number: billNumber }
                  : {number : existingBill.number}),
                updatedAt : new Date().toISOString(),
                modifiedBy: user?.id
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
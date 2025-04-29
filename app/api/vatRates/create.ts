import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { createVatRateSchema } from "@/validation/vatRateValidation";
import { sanitizeData } from "@/lib/sanitize"; 


// Asynchrone : waits for a promise
export async function POST(req: NextRequest) {
    const data = await req.json();

    // currentUser() is a founction from Clerk which allows to retrieve the current User
    const user = await currentUser()


    try {
        
        if (!user) {
            return NextResponse.json({ 
                success: false, 
                message: "Utilisateur non authentifié." 
            }, { status: 401 });
        }

        // Validation avec Zod
        const parsedData = createVatRateSchema.safeParse(data);
        if (!parsedData.success) {
            console.error("Validation Zod échouée :", parsedData.error.format());
                
            return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
        }
                        
        // Sanitizing datas
        const sanitizedData = sanitizeData(parsedData.data);
        console.log("Données nettoyées :", JSON.stringify(sanitizedData));


        const vatRate = await db.vatRate.create({
            data: {
                rate: sanitizedData.rate,
            },
        });


        console.log("Taux de tva créé avec succès.");
        // Toujours retourner la réponse après la création
        return NextResponse.json(vatRate);


    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error
        }, { status: 500 });
    }
}

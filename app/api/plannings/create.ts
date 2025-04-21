import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { createPlanningSchema } from "@/validation/planningValidation";
import { sanitizeData } from "@/lib/sanitize"; 


// Asynchrone : waits for a promise
export async function POST(req: NextRequest) {
    const data = await req.json();
    

    const { 
            title,
            workSiteId,
            clerkUserId,
            start,
            end
        } = data;
        // currentUser() is a founction from Clerk which allows to retrieve the current User
        const user = await currentUser()


    try {
        
        if (!user) {
            return NextResponse.json({ 
                success: false, 
                message: "Utilisateur non authentifié." 
            }, { status: 401 });
        }

        
        // Validation avec Zod (sans 'status')
        const parsedData = createPlanningSchema.safeParse(data);
        if (!parsedData.success) {
            console.error("Validation Zod échouée :", parsedData.error.format());
                
            return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
        }
                        
        // Validation réussie
        // Sanitizing datas
        const sanitizedData = sanitizeData(parsedData.data);
        console.log("Données nettoyées :", JSON.stringify(sanitizedData));


        // We create the planning thanks to te datas retrieved
        const planning = await db.planning.create({
            data: {
                task: sanitizedData.title,
                startTime: sanitizedData.start,
                endTime: sanitizedData.end,
                workSiteId: sanitizedData.workSiteId,
                clerkUserId: sanitizedData.clerkUserId
            },
        });


        console.log("Planning créé avec succès.");
        // Toujours retourner la réponse après la création
        return NextResponse.json({ success: true, data: planning });


    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error
        }, { status: 500 });
    }
}

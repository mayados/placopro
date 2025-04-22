import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { slugify } from '@/lib/utils'
import { createWorkSiteSchema } from "@/validation/workSiteValidation";
import { sanitizeData } from "@/lib/sanitize"; 
import { WorkSiteStatusEnum } from "@prisma/client";


// Asynchrone : waits for a promise
export async function POST(req: NextRequest) {
    const data = await req.json();
    // Explicit validation of CSRF token (in addition of the middleware)
    // const csrfToken = req.headers.get("x-csrf-token");
    // if (!csrfToken || csrfToken !== process.env.CSRF_SECRET) {
    // return new Response("Invalid CSRF token", { status: 403 });
    // }
    // const { 
    //         title,
    //         description,
    //         beginsThe,
    //         status,
    //         road,
    //         addressNumber,
    //         postalCode,
    //         city,
    //         additionnalAddress,
    //         clientId,
    //         } = data;
            // currentUser() is a founction from Clerk which allows to retrieve the current User
            const user = await currentUser()


    try {

        // console.log("titre du chantier : "+title)
        // console.log("description du chantier : "+description)
        // console.log("date de commencement : "+beginsThe)
        // console.log("statut du chantier : "+status)
        // console.log("route  : "+road)
        // console.log("numéro d'adresse : "+addressNumber)
        // console.log("code postal : "+postalCode)
        // console.log("ville : "+city)
        // console.log("complément d'adresse : "+additionnalAddress)
        // console.log("Id du client : "+clientId)

        
        if (!user) {
            return NextResponse.json({ 
                success: false, 
                message: "Utilisateur non authentifié." 
            }, { status: 401 });
        }

        // Validation avec Zod (sans 'status')
        const parsedData = createWorkSiteSchema.safeParse(data);
        if (!parsedData.success) {
            console.error("Validation Zod échouée :", parsedData.error.format());
                
            return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
        }
                        
       // Validation réussie, traiter les données avec le statut
        // Sanitizing datas
        const sanitizedData = sanitizeData(parsedData.data);
        console.log("Données nettoyées :", JSON.stringify(sanitizedData));

        const slug = slugify(sanitizedData.title);

        // We create the company thanks to te datas retrieved
        const workSite = await db.workSite.create({
            data: {
                title: sanitizedData.title,
                description: sanitizedData.description,
                beginsThe: sanitizedData.beginsThe ? new Date(sanitizedData.beginsThe) : null,
                status: sanitizedData.status as WorkSiteStatusEnum,
                completionDate: null,
                road: sanitizedData.road,
                addressNumber: sanitizedData.addressNumber,
                postalCode: sanitizedData.postalCode,
                city: sanitizedData.city,
                additionalAddress: sanitizedData.additionnalAddress,
                clientId: sanitizedData.clientId,
                slug: slug,
            },
        });


        console.log("Chantier créé avec succès.");
        // Toujours retourner la réponse après la création
        return NextResponse.json({ success: true, data: workSite });


    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error
        }, { status: 500 });
    }
}

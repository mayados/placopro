import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { slugify } from '@/lib/utils'



// Asynchrone : waits for a promise
export async function POST(req: NextRequest) {
    const data = await req.json();
    const { 
            title,
            description,
            beginsThe,
            status,
            road,
            addressNumber,
            postalCode,
            city,
            additionnalAddress,
            clientId,
            } = data;
            // currentUser() is a founction from Clerk which allows to retrieve the current User
            const user = await currentUser()


    try {

        console.log("titre du chantier : "+title)
        console.log("description du chantier : "+description)
        console.log("date de commencement : "+beginsThe)
        console.log("statut du chantier : "+status)
        console.log("route  : "+road)
        console.log("numéro d'adresse : "+addressNumber)
        console.log("code postal : "+postalCode)
        console.log("ville : "+city)
        console.log("complément d'adresse : "+additionnalAddress)
        console.log("Id du client : "+clientId)

        
        if (!user) {
            return NextResponse.json({ 
                success: false, 
                message: "Utilisateur non authentifié." 
            }, { status: 401 });
        }

        const slug = slugify(title);

        // We create the company thanks to te datas retrieved
        const workSite = await db.workSite.create({
            data: {
                title: title,
                description: description,
                beginsThe: new Date(beginsThe),
                status: status,
                completionDate: null,
                road: road,
                addressNumber: addressNumber,
                postalCode: postalCode,
                city: city,
                additionalAddress: additionnalAddress,
                clientId: clientId,
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

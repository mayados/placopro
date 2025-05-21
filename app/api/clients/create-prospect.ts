import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { generateSlug} from '@/lib/utils'
import { generateUniqueClientNumber } from '@/lib/utils'
import { createClientSchema } from "@/validation/clientValidation";
import { ClientOrProspectEnum } from "@prisma/client";


// Asynchrone : waits for a promise
export async function POST(req: NextRequest) {
    const data = await req.json();

    console.log("Données reçues dans l'API :", JSON.stringify(data));
    console.log("test pr again")
    console.log("again and again")
    console.log("again and again and again")

            const user = await currentUser()


    try {

        
        if (!user) {
            return NextResponse.json({ 
                success: false, 
                message: "Utilisateur non authentifié." 
            }, { status: 401 });
        }

        // Validation avec Zod (sans 'status')
        const parsedData = createClientSchema.safeParse(data);
        if (!parsedData.success) {
            console.error("Validation Zod échouée :", parsedData.error.format());
        
            return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
        }
                
        // Validation réussie, traiter les données avec le statut
        const validatedData = parsedData.data;
                

        const clientNumber = generateUniqueClientNumber();
        console.log("client number : "+clientNumber)
        console.log("type de clientNumber : "+typeof(clientNumber))
        console.log("type de code postal : "+typeof(validatedData.postalCode))
        console.log("type de téléphone : "+typeof(validatedData.phone))

        console.log("Tentative de création du client...");
        const slug = generateSlug("prospect");

          // Création du client
          const prospect = await db.client.create({
              data: {
                name: validatedData.name,
                firstName: validatedData.firstName,
                mail: validatedData.mail,
                phone: validatedData.phone,
                road: validatedData.road,
                addressNumber: validatedData.addressNumber,
                postalCode: validatedData.postalCode,
                city: validatedData.city,
                additionalAddress: validatedData.additionalAddress,
                slug: slug,
                clientNumber,
                isPseudonymized: false,
                convertedAt: null,
                status: ClientOrProspectEnum.PROSPECT
              },
          });


        console.log("Prospect créé avec succès.");
        // Toujours retourner la réponse après la création
        return NextResponse.json({ success: true, data: prospect });


    } catch (error) {
        console.error("Erreur détaillée :", error instanceof Error ? error.message : error);

        return NextResponse.json({
            success: false,
            error: error
        }, { status: 500 });
    }
}

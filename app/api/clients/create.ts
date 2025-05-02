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

    // const { 
    //         name,
    //         firstName,
    //         mail,
    //         phone,
    //         road,
    //         addressNumber,
    //         postalCode,
    //         city,
    //         additionalAddress,
    //     } = data;
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
        const slug = generateSlug(`${validatedData.name}-${validatedData.firstName}`);

          // Création du client
          const client = await db.client.create({
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
                isAnonymized: false,
                convertedAt: null,
                status: ClientOrProspectEnum.CLIENT
              },
          });


        console.log("Client créé avec succès.");
        // Toujours retourner la réponse après la création
        return NextResponse.json({ success: true, data: client });


    } catch (error) {
        console.error("Erreur détaillée :", error instanceof Error ? error.message : error);

        return NextResponse.json({
            success: false,
            error: error
        }, { status: 500 });
    }
}

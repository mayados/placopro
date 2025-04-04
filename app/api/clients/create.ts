import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { slugify } from '@/lib/utils'
import { generateUniqueClientNumber } from '@/lib/utils'
import { createClientSchema } from "@/validation/clientValidation";


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
    //         prospectNumber,
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
        const { prospectNumber, ...dataWithoutProspectNumber } = data;
        data.prospectNumber = prospectNumber;

        // Validation avec Zod (sans 'status')
        const parsedData = createClientSchema.safeParse(dataWithoutProspectNumber);
        if (!parsedData.success) {
            console.error("Validation Zod échouée :", parsedData.error.format());
        
            return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
        }
                
        // Validation réussie, traiter les données avec le statut
        const validatedData = parsedData.data;
                

        const clientNumber = generateUniqueClientNumber();
        const slug = slugify(validatedData.name+" "+validatedData.firstname+" "+clientNumber)
        console.log("Slug du client : "+slug)
        console.log("client number : "+clientNumber)
        console.log("type de clientNumber : "+typeof(clientNumber))
        console.log("type de slug : "+typeof(slug))
        console.log("type de code postal : "+typeof(validatedData.postalCode))
        console.log("type de téléphone : "+typeof(validatedData.phone))

        let prospectId = null;
        if (prospectNumber && prospectNumber.trim() !== "") {
            const prospect = await db.prospect.findUnique({
                where: { prospectNumber },
            });
            if (prospect) {
                prospectId = prospect.id;
                console.log("Prospect trouvé, ID : ", prospectId);
            } else {
                console.log("Aucun prospect trouvé pour le numéro fourni.");
            }
        }

        console.log("valeur de prospectId : "+prospectId)

          // Création du client
          const client = await db.client.create({
              data: {
                name: validatedData.name,
                firstName: validatedData.firstname,
                mail: validatedData.mail,
                phone: validatedData.phone,
                road: validatedData.road,
                addressNumber: validatedData.addressNumber,
                postalCode: validatedData.postalCode,
                city: validatedData.city,
                additionalAddress: validatedData.additionalAddress,
                slug,
                clientNumber,
                isAnonymized: false,
                prospectId: prospectId,
                //   ...(prospectId !== null && { prospectId }), // Inclure prospectId uniquement s'il existe
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

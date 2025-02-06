import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { slugify } from '@/lib/utils'
import { generateUniqueClientNumber } from '@/lib/utils'


// Asynchrone : waits for a promise
export async function POST(req: NextRequest) {
    const data = await req.json();
    const { 
            name,
            firstName,
            mail,
            phone,
            road,
            addressNumber,
            postalCode,
            city,
            additionalAddress,
            prospectNumber,
            } = data;
            // currentUser() is a founction from Clerk which allows to retrieve the current User
            const user = await currentUser()


    try {

        console.log("nom du client : "+name)
        console.log("Prénom du client : "+firstName)
        console.log("Mail du client : "+mail)
        console.log("Téléphone du client : "+phone)
        console.log("Rue du client : "+road)
        console.log("Numéro d'adresse du client : "+addressNumber)
        console.log("Code postal : "+postalCode)
        console.log("Ville : "+city)
        console.log("Complément d'adresse : "+additionalAddress)
        console.log("numéro de prospect : "+prospectNumber)
        
        if (!user) {
            return NextResponse.json({ 
                success: false, 
                message: "Utilisateur non authentifié." 
            }, { status: 401 });
        }

        const clientNumber = generateUniqueClientNumber();
        const slug = slugify(name+" "+firstName+" "+clientNumber)
        console.log("Slug du client : "+slug)
        console.log("client number : "+clientNumber)
        console.log("type de clientNumber : "+typeof(clientNumber))
        console.log("type de slug : "+typeof(slug))
        console.log("type de code postal : "+typeof(postalCode))
        console.log("type de téléphone : "+typeof(phone))

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
                  name,
                  firstName,
                  mail,
                  phone,
                  road,
                  addressNumber,
                  postalCode,
                  city,
                  additionalAddress,
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

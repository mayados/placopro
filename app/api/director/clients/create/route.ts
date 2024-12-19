import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'


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
        console.log("téléphone l'entreprise : "+phone)
        console.log("Mail du client : "+mail)
        console.log("Téléphone du client : "+phone)
        console.log("Rue du client : "+road)
        console.log("Numéro d'adresse du client : "+addressNumber)
        console.log("Code postal : "+postalCode)
        console.log("Ville : "+city)
        console.log("Complément d'adresse : "+additionalAddress)
        
        if (!user) {
            return NextResponse.json({ 
                success: false, 
                message: "Utilisateur non authentifié." 
            }, { status: 401 });
        }

        const slug = name.toLowerCase()+"-"+firstName.toLowerCase();
        console.log("Slug du client : "+slug)

        let prospectUser = undefined;
        if(prospectNumber !== null){
            prospectUser = await db.prospect.findUnique({
                where: {
                    prospectNumber: prospectNumber,
                }            
            })
        }

        // We create the client thanks to te datas retrieved
        const client = await db.client.create({
            data: {
                name: name,
                firstName: firstName,
                mail: mail,
                phone: phone,
                road: road,
                addressNumber: addressNumber,
                postalCode: postalCode,
                city: city,
                additionalAddress: additionalAddress,
                slug: slug,
                clientNumber: "",
                isAnonymized: false,
                prospect: prospectUser
                ? {
                    // When we pass a relation, prisma wants us to use "connect"
                      connect: {
                          id: prospectUser.id,
                      },
                  }
                : undefined,
                workSites: undefined,
                bills: undefined,
                quotes: undefined,
            },
        });


        console.log("Client créé avec succès.");
        // Toujours retourner la réponse après la création
        return NextResponse.json({ success: true, data: client });


    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error
        }, { status: 500 });
    }
}

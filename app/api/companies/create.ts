import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'


// Asynchrone : waits for a promise
export async function POST(req: NextRequest) {
    const data = await req.json();
    const { 
            name, 
            type, 
            phone, 
            email, 
            capital, 
            rcs, 
            siret, 
            ape, 
            intraCommunityVat, 
            addressNumber, 
            road,  
            additionnalAddress, 
            postalCode, 
            city, 
            insuranceName, 
            insuranceContractNumber ,
            insuranceCoveredZone 
            } = data;
            // currentUser() is a founction from Clerk which allows to retrieve the current User
            const user = await currentUser()


    try {

        console.log("nom de l'entreprise : "+name)
        console.log("type d'entreprise : "+type)
        console.log("téléphone l'entreprise : "+phone)
        console.log("Mail de l'entreprise : "+email)
        console.log("Capital de l'entreprise : "+capital)
        console.log("Rcs de l'entreprise : "+rcs)
        console.log("Siret de l'entreprise : "+siret)
        console.log("APE de l'entreprise : "+ape)
        console.log("TVA intracommunautaire de l'entreprise : "+intraCommunityVat)
        console.log("Numéro d'adresse de l'entreprise : "+addressNumber)
        console.log("Rue de l'entreprise : "+road)
        console.log("Adresse additionnelle de l'entreprise : "+additionnalAddress)
        console.log("Code postal de l'entreprise : "+postalCode)
        console.log("Ville de l'entreprise : "+city)
        console.log("Nom de l'assurance décénnale de l'entreprise : "+insuranceName)
        console.log("Numéro de contrat de l'assurance de l'entreprise : "+insuranceContractNumber)
        console.log("Zone couverte par l'assurance : "+insuranceCoveredZone)
        
        if (!user) {
            return NextResponse.json({ 
                success: false, 
                message: "Utilisateur non authentifié." 
            }, { status: 401 });
        }

        const slug = name.toLowerCase();
        console.log("Slug de l'entreprise : "+slug)


        // We create the company thanks to te datas retrieved
        const company = await db.company.create({
            data: {
                name: name, 
                type: type, 
                phone: phone, 
                mail: email, 
                /* JSON.Stringify has been used to send data in the body request. So every property is a 
                    string. Howerver prisma  is expecting capital property to be a float
                */
                capital: parseFloat(capital), 
                rcs: rcs, 
                siret: siret, 
                ape: ape, 
                intraCommunityVat: intraCommunityVat, 
                addressNumber: addressNumber, 
                road: road,  
                additionnalAddress: additionnalAddress, 
                postalCode: postalCode, 
                city: city, 
                decennialInsuranceName: insuranceName, 
                insuranceContractNumber: insuranceContractNumber ,
                aeraCoveredByInsurance: insuranceCoveredZone ,
                slug: slug,
            },
        });


        console.log("Entreprise créée avec succès.");
        // Toujours retourner la réponse après la création
        return NextResponse.json({ success: true, data: company });


    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error
        }, { status: 500 });
    }
}

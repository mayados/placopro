import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  // Retrieve datas from request's body
  const data = await req.json();
  const { 
    id,
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
    // let {isAnonymized} = data.isAnonymized

  try {

    console.log("numéro de prospect récupéré :"+prospectNumber)

    /* We have to verify which value(s) has/have changed
        So first, we retrieve the client thanks to the id (unique value which doesn't change)
    */
    const originalClient = await db.client.findUnique({
        where: {
            id: id
        }, 
        select: {
            id: true,
            clientNumber: true,
            name: true,
            firstName: true,
            slug: true,
            mail: true,
            phone: true,
            road: true,
            addressNumber: true,
            postalCode: true,
            city: true,
            additionalAddress: true,
            isAnonymized: true,
            prospect: true,
            workSites: true,
            bills: true,
            quotes: true,
          }, 
                   
    })


    let prospectData = null;

    // console.log("le client est-il anonymisé ? "+isAnonymized)

if ((prospectNumber !== null)&&(prospectNumber !== undefined)) {
    const prospectUser = await db.prospect.findUnique({
        where: {
            prospectNumber: prospectNumber,
        },
        select: {
            id: true,
            name: true,
            firstName: true,
            mail: true,
            phone: true,
            prospectNumber: true,
            slug: true,
            isConverted: true,
            client: true,
        }  
    });

    if (prospectUser) {
        prospectData = {
            id: prospectUser.id,
            name: prospectUser.name,
            firstName: prospectUser.firstName,
            mail: prospectUser.mail,
            phone: prospectUser.phone || null,
            prospectNumber: prospectUser.prospectNumber,
            slug: prospectUser.slug,
            isConverted: prospectUser.isConverted,
            client: prospectUser.client,
        };
    }
}

    if(originalClient){
        const client : ClientType= {
            id: id,
            name: originalClient.name,
            firstName: originalClient.firstName,
            slug: originalClient.slug,
            clientNumber: originalClient.clientNumber,
            isAnonymized: originalClient.isAnonymized,
            mail: originalClient.mail,
            phone: originalClient.phone,
            road: originalClient.road,
            addressNumber: originalClient.addressNumber,
            postalCode: originalClient.postalCode,
            city: originalClient.city,
            additionalAddress: originalClient.additionalAddress,
            prospect: originalClient.prospect,

        }



        // if (prospectData) {
        //     await db.client.update({
        //       where: { id: id },
        //       data: {
        //         prospect: {
        //           connect: {
        //             prospectNumber: prospectData.prospectNumber,  // ProspectData doit contenir un `id` valide
        //           }
        //         }
        //       }
        //     });
        //   }
          


        // We verify if the values have changed by comparing original values and values retrieved from the form
        // If it's the case, we replace const client's values by values retrieve from the forms
        if (originalClient.name !== name) client.name = name;
        if (originalClient.name !== name) client.slug = name.toLowerCase()+"-"+firstName.toLowerCase();
        if (originalClient.firstName !== firstName) client.firstName = firstName;
        if (originalClient.firstName !== firstName) client.slug = name.toLowerCase()+"-"+firstName.toLowerCase();
        if (originalClient.mail !== mail) client.mail = mail;
        if (originalClient.phone !== phone) client.phone = phone;
        if (originalClient.prospect?.prospectNumber !== prospectNumber) client.prospect = prospectData;
        // if (originalClient.isAnonymized !== isAnonymized) client.isAnonymized = isAnonymized;
        if (originalClient.road !== road) client.road = road;
        if (originalClient.addressNumber !== addressNumber) client.addressNumber = addressNumber;
        if (originalClient.postalCode !== postalCode) client.postalCode = postalCode;
        if (originalClient.city !== city) client.city = city;
        if (originalClient.additionalAddress !== additionalAddress) client.additionalAddress = additionalAddress;

    

        // We update the values in the database
        const updatedClient = await db.client.update({
            where: { id: id },
            data: {
                name: client.name,
                firstName: client.firstName,
                isAnonymized: originalClient.isAnonymized,
                slug: client.slug,
                mail: client.mail,
                phone: client.phone,
                road: client.road,
                addressNumber: client.addressNumber,
                postalCode: client.postalCode,
                city: client.city,
                additionalAddress: client.additionalAddress,
                // prospectId: prospectData?.id
                // // prospect: client.prospect,
                prospect: prospectData ? {
                    connect: { prospectNumber: client.prospect?.prospectNumber } // Assurez-vous que prospectData contient l'id
                  } : undefined,
                
                
            },
          });

        console.log("updated Client nom : "+updatedClient.name)
        console.log("updated Client prénom : "+updatedClient.firstName)
        console.log("updated Client anonymisé : "+updatedClient.isAnonymized)
        console.log("updated Client mail : "+updatedClient.mail)
        console.log("updated Client phone : "+updatedClient.phone)
        console.log("updated Client road : "+updatedClient.road)
        console.log("updated Client addressNumber : "+updatedClient.addressNumber)
        console.log("updated Client postalCode : "+updatedClient.postalCode)
        console.log("updated Client city : "+updatedClient.city)
        console.log("updated Client additionnalAddress : "+updatedClient.additionalAddress)
        console.log("updated Client prospectNumber : "+updatedClient.prospectId)
        console.log("updated Client slug : "+updatedClient.slug)

        return NextResponse.json({
                success: true, 
                updatedClient,
                status: 200,

            });

    }

    throw new Error("Le client à modifier n'a pas été trouvée'");


  } catch (error) {
    console.log("problème dans la route API"+error)
    return new NextResponse("Internal error, {status: 500}")

  }
}

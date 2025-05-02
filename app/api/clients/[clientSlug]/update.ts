import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { updateClientSchema } from "@/validation/clientValidation";
import { sanitizeData } from "@/lib/sanitize"; 


export async function PUT(req: NextRequest) {
  // Retrieve datas from request's body
  const data = await req.json();
  // Explicit validation of CSRF token (in addition of the middleware)
  const csrfToken = req.headers.get("x-csrf-token");
  if (!csrfToken || csrfToken !== process.env.CSRF_SECRET) {
     return new Response("Invalid CSRF token", { status: 403 });
  }
  // const { 
  //   id,
  //   name,
  //   firstName,
  //   mail,
  //   phone,
  //   road,
  //   addressNumber,
  //   postalCode,
  //   city,
  //   additionalAddress,
  //   // prospectNumber,
  //   } = data;
    // let {isAnonymized} = data.isAnonymized

  try {
    // const { prospectNumber, ...dataWithoutProspectNumber } = data;
    // data.prospectNumber = prospectNumber;
    // console.log("numéro de prospect récupéré :"+prospectNumber)

    // Validation avec Zod (sans 'status')
    const parsedData = updateClientSchema.safeParse(data);
    if (!parsedData.success) {
        console.error("Validation Zod échouée :", parsedData.error.format());
        
        return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
    }
                
    // Validation réussie
    // Sanitizing datas
    const sanitizedData = sanitizeData(parsedData.data);
    console.log("Données nettoyées :", JSON.stringify(sanitizedData));

    /* We have to verify which value(s) has/have changed
        So first, we retrieve the client thanks to the id (unique value which doesn't change)
    */
    const originalClient = await db.client.findUnique({
        where: {
            id: sanitizedData.id
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
            // prospect: true,
            workSites: true,
            bills: true,
            quotes: true,
          }, 
                   
    })


    // let prospectData = null;

    // console.log("le client est-il anonymisé ? "+isAnonymized)

    if(originalClient){
        const client : ClientType= {
            id: sanitizedData.id,
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

        }


        // We verify if the values have changed by comparing original values and values retrieved from the form
        // If it's the case, we replace const client's values by values retrieve from the forms
        if (originalClient.name !== sanitizedData.name) client.name = sanitizedData.name;
        if (originalClient.name !== sanitizedData.name) client.slug = sanitizedData.name.toLowerCase()+"-"+sanitizedData.firstName.toLowerCase();
        if (originalClient.firstName !== sanitizedData.firstname) client.firstName = sanitizedData.firstname;
        if (originalClient.firstName !== sanitizedData.firstname) client.slug = sanitizedData.name.toLowerCase()+"-"+sanitizedData.firstname.toLowerCase();
        if (originalClient.mail !== sanitizedData.mail) client.mail = sanitizedData.mail;
        if (originalClient.phone !== sanitizedData.phone) client.phone = sanitizedData.phone;
        // if (originalClient.isAnonymized !== isAnonymized) client.isAnonymized = isAnonymized;
        if (originalClient.road !== sanitizedData.road) client.road = sanitizedData.road;
        if (originalClient.addressNumber !== sanitizedData.addressNumber) client.addressNumber = sanitizedData.addressNumber;
        if (originalClient.postalCode !== sanitizedData.postalCode) client.postalCode = sanitizedData.postalCode;
        if (originalClient.city !== sanitizedData.city) client.city = sanitizedData.city;
        if (originalClient.additionalAddress !== sanitizedData.additionalAddress) client.additionalAddress = sanitizedData.additionalAddress;

    

        // We update the values in the database
        const updatedClient = await db.client.update({
            where: { id: sanitizedData.id },
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

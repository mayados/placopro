import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { updateWorkSiteSchema } from "@/validation/workSiteValidation";


export async function PUT(req: NextRequest) {
  // Retrieve datas from request's body
  const data = await req.json();

  const { 
        id,
        title,
        // slug,
        description,
        beginsThe,
        status,
        completionDate,
        road,
        additionalAddress,
        addressNumber,
        postalCode,
        city,
        client
    } = data;

  try {
    // Exclure 'id' du schéma de validation Zod
    const { id, ...dataWithoutId } = data;
    
            
    // Validation avec Zod (sans 'status')
    const parsedData = updateWorkSiteSchema.safeParse(dataWithoutId);
    if (!parsedData.success) {
        console.error("Validation Zod échouée :", parsedData.error.format());
    
        return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
    }
            
    // Validation réussie, traiter les données avec le statut
    const validatedData = parsedData.data;
            
    // Ajoute le id aux données validées
    data.id = id;
    console.log("le client est : "+client.name)

    const clientData = await db.client.findUnique({
      where: {
          id: client.id,
      }
  });

  if(clientData){

    /* We have to verify which value(s) has/have changed
        So first, we retrieve the workSite thanks to the id (unique value which doesn't change)
    */
    const originalWorkSite = await db.workSite.findUnique({
        where: {
            id: id
        },
        select: {
          id: true,
          slug: true,
          title: true, 
          description: true,
          beginsThe: true,
          status: true,
          completionDate: true,
          road: true,  
          addressNumber: true,
          additionalAddress: true, 
          postalCode: true, 
          city: true, 
          client: true
        },            
    })

    if(originalWorkSite){
        const workSite : WorkSiteTypeWithoutQuotesAndPlannings= {
            id: id,
            slug: originalWorkSite.slug,
            title: originalWorkSite.title, 
            description: originalWorkSite.description,
            beginsThe: originalWorkSite.beginsThe ?? null,
            status: originalWorkSite.status,
            completionDate: originalWorkSite.completionDate,
            road: originalWorkSite.road,  
            additionalAddress: originalWorkSite.additionalAddress ?? "", 
            postalCode: originalWorkSite.postalCode, 
            city: originalWorkSite.city, 
            client: originalWorkSite.client,
            addressNumber: originalWorkSite.addressNumber,
        }

        // We verify if the values have changed by comparing original values and values retrieved from the form
        // If it's the case, we replace const workSite's values by values retrieve from the forms
        if (originalWorkSite.title !== validatedData.title) workSite.title = validatedData.title;
        if (originalWorkSite.description !== validatedData.description) workSite.description = validatedData.description;
        if (originalWorkSite.beginsThe !== validatedData.beginsThe) workSite.beginsThe = validatedData.beginsThe;
        if (originalWorkSite.status !== validatedData.status) workSite.status = validatedData.status;
        if (originalWorkSite.completionDate !== validatedData.completionDate) workSite.completionDate = validatedData.completionDate;
        if (originalWorkSite.road !== validatedData.road) workSite.road = validatedData.road;
        if (originalWorkSite.additionalAddress !== validatedData.additionalAddress) workSite.additionalAddress = validatedData.additionalAddress;
        if (originalWorkSite.postalCode !== validatedData.postalCode) workSite.postalCode = validatedData.postalCode;
        if (originalWorkSite.addressNumber !== validatedData.addressNumber) workSite.addressNumber = validatedData.addressNumber;
        if (originalWorkSite.road !== validatedData.road) workSite.road = validatedData.road;
        // if (originalWorkSite.postalCode !== postalCode) workSite.postalCode = postalCode;
        if (originalWorkSite.city !== validatedData.city) workSite.city = validatedData.city;
        if (originalWorkSite.client.id !== client.id) workSite.client = clientData;

    

        // We update tes values in the database
        const updatedworkSite = await db.workSite.update({
            where: { id: id },
            data: {
                title: workSite.title, 
                description: workSite.description, 
                beginsThe: workSite.beginsThe, 
                status: workSite.status, 
                completionDate: workSite.completionDate, 
                road: workSite.road, 
                additionalAddress: workSite.additionalAddress, 
                postalCode: workSite.postalCode, 
                addressNumber: workSite.addressNumber, 
                city: workSite.city, 
                clientId: clientData.id, 
            },
            include: { client: true },
          });

        return NextResponse.json(updatedworkSite , { status: 200 });

    }

    throw new Error("Le chantier à modifier n'a pas été trouvé'");

  }


  throw new Error("Le client n'a pas été trouvé");


  } catch (error) {
    console.error("Error with workSite's update:", error);
    return new NextResponse("Internal error, {status: 500}")

  }
}

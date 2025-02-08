import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { slugify } from '@/lib/utils'

export async function PUT(req: NextRequest) {
  // Retrieve datas from request's body
  const data = await req.json();
  const { 
        id,
        title,
        slug,
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
            beginsThe: originalWorkSite.beginsThe,
            status: originalWorkSite.status,
            completionDate: originalWorkSite.completionDate,
            road: originalWorkSite.road,  
            additionnalAddress: originalWorkSite.additionalAddress, 
            postalCode: originalWorkSite.postalCode, 
            city: originalWorkSite.city, 
            client: originalWorkSite.client,
            addressNumber: originalWorkSite.addressNumber,
        }

        // We verify if the values have changed by comparing original values and values retrieved from the form
        // If it's the case, we replace const workSite's values by values retrieve from the forms
        if (originalWorkSite.title !== title) workSite.title = title;
        if (originalWorkSite.title !== title) workSite.slug = slugify(title);
        if (originalWorkSite.description !== description) workSite.description = description;
        if (originalWorkSite.beginsThe !== beginsThe) workSite.beginsThe = beginsThe;
        if (originalWorkSite.status !== status) workSite.status = status;
        if (originalWorkSite.completionDate !== completionDate) workSite.completionDate = completionDate;
        if (originalWorkSite.road !== road) workSite.road = road;
        if (originalWorkSite.additionalAddress !== additionalAddress) workSite.additionnalAddress = additionalAddress;
        if (originalWorkSite.postalCode !== postalCode) workSite.postalCode = postalCode;
        if (originalWorkSite.addressNumber !== addressNumber) workSite.addressNumber = addressNumber;
        if (originalWorkSite.road !== road) workSite.road = road;
        if (originalWorkSite.postalCode !== postalCode) workSite.postalCode = postalCode;
        if (originalWorkSite.city !== city) workSite.city = city;
        if (originalWorkSite.client.id !== client.id) workSite.client = clientData;

    

        // We update tes values in the database
        const updatedworkSite = await db.workSite.update({
            where: { id: id },
            data: {
                slug: workSite.slug,
                title: workSite.title, 
                description: workSite.description, 
                beginsThe: workSite.beginsThe, 
                status: workSite.status, 
                completionDate: workSite.completionDate, 
                road: workSite.road, 
                additionalAddress: workSite.additionnalAddress, 
                postalCode: workSite.postalCode, 
                addressNumber: workSite.addressNumber, 
                city: workSite.city, 
                clientId: clientData.id, 
            },
            include: { client: true },
          });

        return NextResponse.json({updatedworkSite }, { status: 200 });

    }

    throw new Error("Le chantier à modifier n'a pas été trouvé'");

  }


  throw new Error("Le client n'a pas été trouvé");


  } catch (error) {
    console.error("Error with workSite's update:", error);
    return new NextResponse("Internal error, {status: 500}")

  }
}

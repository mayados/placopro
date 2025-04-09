import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { updateCompanySchema } from "@/validation/companyValidation";
import { sanitizeData } from "@/lib/sanitize"; 


export async function PUT(req: NextRequest) {
  // Retrieve datas from request's body
  const data = await req.json();
  // Explicit validation of CSRF token (in addition of the middleware)
  const csrfToken = req.headers.get("x-csrf-token");
  if (!csrfToken || csrfToken !== process.env.CSRF_SECRET) {
    return new Response("Invalid CSRF token", { status: 403 });
  }
  const { 
    id,
    slug,
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

  try {

      const parsedData = updateCompanySchema.safeParse(data);
      if (!parsedData.success) {
          console.error("Validation Zod échouée :", parsedData.error.format());
                
          return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
      }
                        
      // Validation réussie, traiter les données avec le statut
     // Validation réussie
     // Sanitizing datas
     const sanitizedData = sanitizeData(parsedData.data);
     console.log("Données nettoyées :", JSON.stringify(sanitizedData));

    /* We have to verify which value(s) has/have changed
        So first, we retrieve the company thanks to the id (unique value which doesn't change)
    */
    const originalCompany = await db.company.findUnique({
        where: {
            id: id
        }            
    })

    if(originalCompany){
        const company : CompanyType= {
            id: id,
            slug: originalCompany.slug,
            name: originalCompany.name, 
            type: originalCompany.type, 
            phone: originalCompany.phone, 
            mail: originalCompany.mail, 
            capital: originalCompany.capital, 
            rcs: originalCompany.rcs, 
            siret: originalCompany.siret, 
            ape: originalCompany.ape, 
            intraCommunityVat: originalCompany.intraCommunityVat, 
            addressNumber: originalCompany.addressNumber, 
            road: originalCompany.road,  
            additionnalAddress: originalCompany.additionnalAddress, 
            postalCode: originalCompany.postalCode, 
            city: originalCompany.city, 
            decennialInsuranceName: originalCompany.decennialInsuranceName, 
            insuranceContractNumber: originalCompany.insuranceContractNumber ,
            aeraCoveredByInsurance: originalCompany.aeraCoveredByInsurance, 

        }

        // We verify if the values have changed by comparing original values and values retrieved from the form
        // If it's the case, we replace const company's values by values retrieve from the forms
        if (originalCompany.name !== sanitizedData.name) company.name = sanitizedData.name;
        if (originalCompany.name !== sanitizedData.name) company.slug = sanitizedData.name.toLowerCase();
        if (originalCompany.type !== sanitizedData.type) company.type = sanitizedData.type;
        if (originalCompany.phone !== sanitizedData.phone) company.phone = sanitizedData.phone;
        if (originalCompany.capital !== sanitizedData.capital) company.capital = sanitizedData.capital;
        if (originalCompany.rcs !== sanitizedData.rcs) company.rcs = sanitizedData.rcs;
        if (originalCompany.siret !== sanitizedData.siret) company.siret = sanitizedData.siret;
        if (originalCompany.ape !== sanitizedData.ape) company.ape = sanitizedData.ape;
        if (originalCompany.intraCommunityVat !== sanitizedData.intraCommunityVat) company.intraCommunityVat = sanitizedData.intraCommunityVat;
        if (originalCompany.addressNumber !== sanitizedData.addressNumber) company.addressNumber = sanitizedData.addressNumber;
        if (originalCompany.road !== sanitizedData.road) company.road = sanitizedData.road;
        if (originalCompany.additionnalAddress !== sanitizedData.additionnalAddress) company.additionnalAddress = sanitizedData.additionnalAddress;
        if (originalCompany.postalCode !== sanitizedData.postalCode) company.postalCode = sanitizedData.postalCode;
        if (originalCompany.city !== sanitizedData.city) company.city = sanitizedData.city;
        if (originalCompany.decennialInsuranceName !== sanitizedData.insuranceName) company.decennialInsuranceName = sanitizedData.insuranceName;
        if (originalCompany.insuranceContractNumber !== sanitizedData.insuranceContractNumber) company.insuranceContractNumber = sanitizedData.insuranceContractNumber;
        if (originalCompany.aeraCoveredByInsurance !== sanitizedData.insuranceCoveredZone) company.aeraCoveredByInsurance = sanitizedData.insuranceCoveredZone;
    

        // We update tes values in the database
        const updatedCompany = await db.company.update({
            where: { id: id },
            data: {
                slug: company.slug,
                name: company.name, 
                type: company.type, 
                phone: company.phone, 
                mail: company.mail, 
                capital: company.capital, 
                rcs: company.rcs, 
                siret: company.siret, 
                ape: company.ape, 
                intraCommunityVat: company.intraCommunityVat, 
                addressNumber: company.addressNumber, 
                road: company.road,  
                additionnalAddress: company.additionnalAddress, 
                postalCode: company.postalCode, 
                city: company.city, 
                decennialInsuranceName: company.decennialInsuranceName, 
                insuranceContractNumber: company.insuranceContractNumber ,
                aeraCoveredByInsurance: company.aeraCoveredByInsurance, 
            },
          });

        return NextResponse.json({updatedCompany }, { status: 200 });

    }

    throw new Error("L'entreprise à modifier n'a pas été trouvée'");


  } catch (error) {
    console.error("Error with company's update:", error);
    return new NextResponse("Internal error, {status: 500}")

  }
}

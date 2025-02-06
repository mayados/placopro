import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  // Retrieve datas from request's body
  const data = await req.json();
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
        if (originalCompany.name !== name) company.name = name;
        if (originalCompany.name !== name) company.slug = name.toLowerCase();
        if (originalCompany.type !== name) company.type = type;
        if (originalCompany.phone !== phone) company.phone = phone;
        if (originalCompany.capital !== capital) company.capital = capital;
        if (originalCompany.rcs !== rcs) company.rcs = rcs;
        if (originalCompany.siret !== siret) company.siret = siret;
        if (originalCompany.ape !== ape) company.ape = ape;
        if (originalCompany.intraCommunityVat !== intraCommunityVat) company.intraCommunityVat = intraCommunityVat;
        if (originalCompany.addressNumber !== addressNumber) company.addressNumber = addressNumber;
        if (originalCompany.road !== road) company.road = road;
        if (originalCompany.additionnalAddress !== additionnalAddress) company.additionnalAddress = additionnalAddress;
        if (originalCompany.postalCode !== postalCode) company.postalCode = postalCode;
        if (originalCompany.city !== city) company.city = city;
        if (originalCompany.decennialInsuranceName !== insuranceName) company.decennialInsuranceName = insuranceName;
        if (originalCompany.insuranceContractNumber !== insuranceContractNumber) company.insuranceContractNumber = insuranceContractNumber;
        if (originalCompany.aeraCoveredByInsurance !== insuranceCoveredZone) company.aeraCoveredByInsurance = insuranceCoveredZone;
    

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

        return NextResponse.json({updatedCompany: updatedCompany }, { status: 200 });

    }

    throw new Error("L'entreprise à modifier n'a pas été trouvée'");


  } catch (error) {
    console.error("Error with company's update:", error);
    return new NextResponse("Internal error, {status: 500}")

  }
}

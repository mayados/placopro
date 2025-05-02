import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {

    try{
        const companiesFound = await db.company.findMany({});
        const companies = companiesFound.map((company: CompanyType) => ({
            id: company.id,
            name: company.name,
            slug: company.slug,
            type: company.type,
            phone: company.phone,
            mail: company.mail,
            capital: company.capital,
            rcs: company.rcs,
            siret: company.rcs,
            ape: company.ape,
            intraCommunityVat: company.intraCommunityVat,
            road: company.road,
            addressNumber: company.addressNumber,
            postalCode: company.postalCode,
            city: company.city,
            additionnalAddress: company.additionnalAddress,
            insuranceName: company.decennialInsuranceName,
            insuranceContractNumber: company.insuranceContractNumber,
            insuranceCoveredZone: company.aeraCoveredByInsurance,
          }));

        return NextResponse.json({
            companies: companies,
        })

    } catch (error) {
        console.log("[COMPANIES]", error)

        return new NextResponse("Internal error, {status: 500}")
    }

}
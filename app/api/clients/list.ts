import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {

    try{
        const clientsFound = await db.client.findMany({});
        const clients = clientsFound.map((client: ClientType) => ({
            id: client.id,
            clientNumber: client.clientNumber,
            name: client.name,
            firstName: client.firstName,
            slug: client.slug,
            mail: client.mail,
            phone: client.phone,
            road: client.road,
            addressNumber: client.addressNumber,
            postalCode: client.postalCode,
            city: client.city,
            additionalAddress: client.additionalAddress,
            isAnonymized: client.isAnonymized,
            prospect: client.prospect,
            workSites: client.workSites,
            bills: client.bills,
            quotes: client.quotes,
          }));

        return NextResponse.json({
            clients: clients,
        })

    } catch (error) {
        console.log("[CLIENTS]", error)

        return new NextResponse("Internal error, {status: 500}")
    }

}
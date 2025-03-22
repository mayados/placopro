import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params}: {params: {billNumber: string}})
{
    const resolvedParams = await params;
    const billNumber = resolvedParams.billNumber;

    try{

        const bill = await db.bill.findUnique({
            where: {
                number: billNumber
            },
            include: {
                client: true,
                workSite: true,
                quote: true,
                // services: true,
                // on inclut les BillServices, puis les services des BillServices, et enfin les quoteService des services
                services: {
                    include: {
                        service: {
                            include: {
                                quotes: true // Inclure les quoteServices associés à chaque service
                            }
                        }
                    }
                }
            },         
        })

        console.log("Je récupère une certaine facture : "+bill)

        return NextResponse.json({ 
            success: true, 
            bill: bill,
            status: 200,
        })

    } catch (error) {
        console.log("[BILL]", error)

        return new NextResponse("Internal error, {status: 500}")
    }
}
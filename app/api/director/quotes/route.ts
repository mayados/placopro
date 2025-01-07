import { db } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {

    try{
        const quotes = await db.quote.findMany({
            select: {
                id: true,
                number: true,
                client: true,
                status: true,
                workSite: true,
                workStartDate: true,
                validityEndDate: true,
              },
              orderBy: {
                issueDate: 'asc',
              },
        });


          const draftQuotes = await db.quote.findMany({
            where: {
                status: {
                    contains: "Draft",
                    mode: 'insensitive',
                }
            },
            select: {
                id: true,
                number: true,
                client: true,
                status: true,
                workSite: true,
                workStartDate: true,
                validityEndDate: true,
            },
            orderBy: {
                issueDate: 'asc',
              },
        })

          const readyToBeSentQuotes = await db.quote.findMany({
            where: {
                status: {
                    contains: "Ready to be sent",
                    mode: 'insensitive',
                }
            },
            select: {
                id: true,
                number: true,
                client: true,
                status: true,
                workSite: true,
                workStartDate: true,
                validityEndDate: true,
            },
            orderBy: {
                issueDate: 'asc',
              },
        })

          const sentQuotes = await db.quote.findMany({
            where: {
                status: {
                    contains: "Sent",
                    mode: 'insensitive',
                }
            },
            select: {
                id: true,
                number: true,
                client: true,
                status: true,
                workSite: true,
                workStartDate: true,
                validityEndDate: true,
            },
            orderBy: {
                issueDate: 'asc',
              },
        })

          const acceptedQuotes = await db.quote.findMany({
            where: {
                status: {
                    contains: "Accepted",
                    mode: 'insensitive',
                }
            },
            select: {
                id: true,
                number: true,
                client: true,
                status: true,
                workSite: true,
                workStartDate: true,
                validityEndDate: true,
            },
            orderBy: {
                issueDate: 'asc',
              },
        })

          const refusedQuotes = await db.quote.findMany({
            where: {
                status: {
                    contains: "Refused",
                    mode: 'insensitive',
                }
            },
            select: {
                id: true,
                number: true,
                client: true,
                status: true,
                workSite: true,
                workStartDate: true,
                validityEndDate: true,
            },
            orderBy: {
                issueDate: 'asc',
              },
        })


        //Counting number of recipes
        const totalQuotes: number = await db.quote.count();
        
        const totalDraftQuotes: number = await db.quote.count({ 
                where: { status: { contains: "Draft", mode: 'insensitive' } }
        });

        const totalReadyToBeSentQuotes: number = await db.quote.count({ 
            where: { status: { contains: "Ready to be sent", mode: 'insensitive' } }
        });

        const totalSentQuotes: number = await db.quote.count({ 
            where: { status: { contains: "Sent", mode: 'insensitive' } }
        });

        const totalAcceptedQuotes: number = await db.quote.count({ 
            where: { status: { contains: "Accepted", mode: 'insensitive' } }
        });

        const totalRefusedQuotes: number = await db.quote.count({ 
            where: { status: { contains: "Refused", mode: 'insensitive' } }
        });
          
        return NextResponse.json({
            success: true,
            quotes: quotes,
            draftQuotes: draftQuotes,
            readyToBeSentQuotes: readyToBeSentQuotes,
            sentQuotes: sentQuotes,
            acceptedQuotes: acceptedQuotes,
            refusedQuotes: refusedQuotes,
            totalQuotes : totalQuotes,
            totalDraftQuotes : totalDraftQuotes,
            totalReadyToBeSentQuotes : totalReadyToBeSentQuotes,
            totalSentQuotes : totalSentQuotes,
            totalAcceptedQuotes : totalAcceptedQuotes,
            totalRefusedQuotes : totalRefusedQuotes,

        })

    } catch (error) {
        return new NextResponse("Internal error, {status: 500}")
    }

}
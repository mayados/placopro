import { db } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {

    try{
        const bills = await db.bill.findMany({
            select: {
                id: true,
                number: true,
                client: true,
                status: true,
                workSite: true,
                workStartDate: true,
                dueDate: true,
                issueDate: true
              },
              orderBy: {
                issueDate: 'asc',
              },
        });

          const readyToBeSentBills = await db.bill.findMany({
            where: {
                status: {
                    contains: "Ready",
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
                dueDate: true,
                issueDate: true
            },
            orderBy: {
                issueDate: 'asc',
              },
        })

          const sentBills = await db.bill.findMany({
            where: {
                status: "Sent",
            },
            select: {
                id: true,
                number: true,
                client: true,
                status: true,
                workSite: true,
                workStartDate: true,
                dueDate: true,
                issueDate: true
            },
            orderBy: {
                issueDate: 'asc',
              },
        })

          const draftBills = await db.bill.findMany({
            where: {
                status: {
                    contains: "draft",
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
                dueDate: true,
                issueDate: true
            },
            orderBy: {
                issueDate: 'asc',
              },
        })

          const canceledBills = await db.bill.findMany({
            where: {
                status: {
                    contains: "canceled",
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
                dueDate: true,
                issueDate: true
            },
            orderBy: {
                issueDate: 'asc',
              },
        })


        //Counting number of bills
        const totalBills: number = await db.bill.count();
        
        const totalDraftBills: number = await db.bill.count({ 
                where: { status: { contains: "draft", mode: 'insensitive' } }
        });

        const totalReadyToBeSentBills: number = await db.bill.count({ 
            where: { status: { contains: "Ready", mode: 'insensitive' } }
        });

        const totalSentBills: number = await db.bill.count({ 
            where: { status: { contains: "Sent", mode: 'insensitive' } }
        });


        const totalCanceledBills: number = await db.bill.count({ 
            where: { status: { contains: "Canceled", mode: 'insensitive' } }
        });

        console.log("les bills retrieved : "+bills)
          
        return NextResponse.json({
            success: true,
            bills: bills,
            draftBills: draftBills,
            readyToBeSentBills: readyToBeSentBills,
            sentBills: sentBills,
            canceledBills: canceledBills,
            totalBills : totalBills,
            totalDraftBills : totalDraftBills,
            totalReadyToBeSentBills : totalReadyToBeSentBills,
            totalSentBills : totalSentBills,
            totalCanceledBills : totalCanceledBills,

        })

    } catch (error) {
        return new NextResponse("Internal error, {status: 500}")
    }

}
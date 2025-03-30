import { db } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {

    try{
        const creditNotes = await db.creditNote.findMany({
            select: {
                id: true,
                number: true,
                bill: true,
                isSettled: true,
                issueDate: true
              },
              orderBy: {
                issueDate: 'asc',
              },
        });

        const settledCreditNotes = await db.creditNote.findMany({
            where: {
                isSettled: true
            },
            select: {
                id: true,
                number: true,
                bill: true,
                issueDate: true
            },
            orderBy: {
                issueDate: 'asc',
              },
        })


    const notSettledCreditNotes = await db.creditNote.findMany({
        where: {
            isSettled: false
        },
        select: {
            id: true,
            number: true,
            bill: true,
            issueDate: true
        },
        orderBy: {
            issueDate: 'asc',
        },
    })



    //Counting number of credit notes
    const totalCreditNotes: number = await db.creditNote.count();
        
    const totalSettledCreditNotes: number = await db.creditNote.count({ 
        where: { isSettled: true } 
    });

    const totalNotSettledCreditNotes: number = await db.creditNote.count({ 
        where: { isSettled: false } 
    });

    console.log("credit notes retrieved : "+creditNotes)
          
    return NextResponse.json({
            success: true,
            creditNotes: creditNotes,
            settledCreditNotes: settledCreditNotes,
            notSettledCreditNotes: notSettledCreditNotes,
            totalCreditNotes : totalCreditNotes,
            totalSettledCreditNotes: totalSettledCreditNotes,
            totalNotSettledCreditNotes: totalNotSettledCreditNotes
        })

    } catch (error) {
        return new NextResponse("Internal error, {status: 500}")
    }

}
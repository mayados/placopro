import { db } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {

    try{
        const { searchParams } = new URL(req.url);

        // Retrieve parameters
        const page = parseInt(searchParams.get("page") || "1", 10);
        const pageSettled = parseInt(searchParams.get("pageSettled") || "1", 10);
        const pageNotSettled = parseInt(searchParams.get("pageNotSettled") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
    
        const skip = (page - 1) * limit;
        const skipSettled = (pageSettled - 1) * limit;
        const skipNotSettled = (pageNotSettled - 1) * limit;

        const creditNotes = await db.creditNote.findMany({
            select: {
                id: true,
                number: true,
                bill: true,
                isSettled: true,
                issueDate: true
            },
                skip,
                take: limit,
                orderBy: {
                issueDate: "desc",
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
            skip: skipSettled,
            take: limit,
            orderBy: {
              issueDate: "desc",
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
        skip: skipNotSettled,
        take: limit,
        orderBy: {
          issueDate: "desc",
        },
    })

    console.log('creditNotes:', creditNotes);
    console.log('settledCreditNotes:', settledCreditNotes);
    console.log('notSettledCreditNotes:', notSettledCreditNotes);

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
            creditNotes: creditNotes || [],
            settledCreditNotes: settledCreditNotes || [],
            notSettledCreditNotes: notSettledCreditNotes || [],
            totalCreditNotes : totalCreditNotes,
            totalSettledCreditNotes: totalSettledCreditNotes,
            totalNotSettledCreditNotes: totalNotSettledCreditNotes
        })

    } catch (error) {
        
        console.error("Erreur dans l'API GET /api/creditNotes :", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }

}
import { db } from "@/lib/db";
import { BillStatusEnum } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {

    try{

        const { searchParams } = new URL(req.url);

        // Retrieve parameters
        const page = parseInt(searchParams.get("page") || "1", 10);
        const pageReadyToBeSent = parseInt(searchParams.get("pageReadyToBeSent") || "1", 10);
        const pageSent = parseInt(searchParams.get("pageSent") || "1", 10);
        const pageDraft = parseInt(searchParams.get("pageDraft") || "1", 10);
        const pageCanceled = parseInt(searchParams.get("pageCanceled") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
    
        const skip = (page - 1) * limit;
        const skipReadyToBeSent = (pageReadyToBeSent - 1) * limit;
        const skipSent = (pageSent - 1) * limit;
        const skipDraft = (pageDraft - 1) * limit;
        const skipCanceled = (pageCanceled - 1) * limit;

        const bills = await db.bill.findMany({
            select: {
                id: true,
                number: true,
                client: true,
                status: true,
                workSite: true,
                workStartDate: true,
                dueDate: true,
                issueDate: true,
                slug: true,
            },
            skip,
            take: limit,
            orderBy: {
                issueDate: "asc",
            },
        });

          const readyToBeSentBills = await db.bill.findMany({
            where: {
                status: BillStatusEnum.READY
            },
            select: {
                id: true,
                number: true,
                client: true,
                status: true,
                workSite: true,
                workStartDate: true,
                dueDate: true,
                issueDate: true,
                slug: true,

            },
            skip : skipReadyToBeSent,
            take: limit,
            orderBy: {
                issueDate: "asc",
            },
        })

          const sentBills = await db.bill.findMany({
            where: {
                status: BillStatusEnum.SENT,
            },
            select: {
                id: true,
                number: true,
                client: true,
                status: true,
                workSite: true,
                workStartDate: true,
                dueDate: true,
                issueDate: true,
                slug: true,

            },
            skip: skipSent,
            take: limit,
            orderBy: {
                issueDate: "asc",
            },
        })

          const draftBills = await db.bill.findMany({
            where: {
                status: BillStatusEnum.DRAFT
            },
            select: {
                id: true,
                number: true,
                client: true,
                status: true,
                workSite: true,
                workStartDate: true,
                dueDate: true,
                issueDate: true,
                slug: true,

            },
            skip: skipDraft,
            take: limit,
            orderBy: {
                issueDate: "asc",
            },
        })

          const canceledBills = await db.bill.findMany({
            where: {
                status: BillStatusEnum.CANCELED
            },
            select: {
                id: true,
                number: true,
                client: true,
                status: true,
                workSite: true,
                workStartDate: true,
                dueDate: true,
                issueDate: true,
                slug: true,

            },
            skip: skipCanceled,
            take: limit,
            orderBy: {
                issueDate: "asc",
            },
        })


        //Counting number of bills
        const totalBills: number = await db.bill.count();
        
        const totalDraftBills: number = await db.bill.count({ 
                where: { status: BillStatusEnum.DRAFT }
        });

        const totalReadyToBeSentBills: number = await db.bill.count({ 
            where: { status: BillStatusEnum.READY }
        });

        const totalSentBills: number = await db.bill.count({ 
            where: { status: BillStatusEnum.SENT }
        });


        const totalCanceledBills: number = await db.bill.count({ 
            where: { status: BillStatusEnum.CANCELED }
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
        console.error("Erreur dans l'API GET /api/workSites :", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }

}